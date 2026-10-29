import React, { useState, useEffect, useRef } from 'react'
import { VirtualFileSystem } from '../services/VirtualFileSystem'
import { CommandRegistry } from '../services/CommandRegistry'
import { CommandParser } from '../services/CommandParser'
import type { TerminalEntry } from '../data/types'
import { PROJECTS, WELCOME_TEXT } from '../data/portfolioData'
import { THEMES } from '../data/themes'
import { TerminalInput } from './TerminalInput'
import { TerminalOutput } from './TerminalOutput'
import { CustomIcon } from './CustomIcon'
import { Maximize2, Minimize2, Minus } from 'lucide-react'

export const TerminalWindow: React.FC = () => {
  const [entries, setEntries] = useState<TerminalEntry[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [isLocked, setIsLocked] = useState<boolean>(false)

  // Theme management: persisted in localStorage
  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem('terminal_theme') || 'default'
  })

  // Window management states: normal, maximized, minimized, dragging
  const [isMaximized, setIsMaximized] = useState<boolean>(false)
  const [isMinimized, setIsMinimized] = useState<boolean>(false)
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isCheered, setIsCheered] = useState<boolean>(false)

  // Dynamic window width measurement for Pacman bar
  const [barLength, setBarLength] = useState<number>(30)

  // Drag tracking refs
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  })

  // Animation phases: 'typing' -> 'streaming' -> 'loading-bar' -> 'done'
  const [animPhase, setAnimPhase] = useState<'typing' | 'streaming' | 'loading-bar' | 'done'>('typing')
  const [typedCommand, setTypedCommand] = useState<string>('')
  const [streamedLineIndex, setStreamedLineIndex] = useState<number>(0)
  const [loadPercent, setLoadPercent] = useState<number>(0)
  const [chompState, setChompState] = useState<boolean>(true)

  const vfsRef = useRef<VirtualFileSystem>(new VirtualFileSystem())
  const registryRef = useRef<CommandRegistry>(new CommandRegistry())
  const terminalBodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const welcomeLines = useRef<string[]>(WELCOME_TEXT.split('\n'))

  // Measure container width to dynamically size the Pacman bar across the entire window
  useEffect(() => {
    const updateBarSize = () => {
      if (terminalBodyRef.current) {
        const containerWidth = terminalBodyRef.current.clientWidth
        // Each monospace char ~7.2px on mobile (at text-[11px]), ~8.5px on desktop
        const charWidth = window.innerWidth < 640 ? 7.2 : 8.5
        const marginOffset = window.innerWidth < 640 ? 120 : 140
        const availableChars = Math.floor((containerWidth - marginOffset) / charWidth)
        setBarLength(Math.max(8, Math.min(80, availableChars)))
      }
    }

    updateBarSize()
    window.addEventListener('resize', updateBarSize)
    window.addEventListener('orientationchange', updateBarSize)
    return () => {
      window.removeEventListener('resize', updateBarSize)
      window.removeEventListener('orientationchange', updateBarSize)
    }
  }, [isMaximized])

  const finishWelcomeInstantly = () => {
    if (animTimerRef.current) {
      clearTimeout(animTimerRef.current)
    }
    setAnimPhase('done')
    const completedDashes = '-'.repeat(barLength)
    setEntries([
      {
        id: 'welcome-cmd',
        type: 'input',
        command: 'welcome',
        cwd: '~',
        content: '',
        timestamp: Date.now() - 200,
      },
      {
        id: 'welcome-out',
        type: 'output',
        content: WELCOME_TEXT,
        timestamp: Date.now() - 100,
      },
      {
        id: 'welcome-pacman-loader',
        type: 'output',
        content: `[${completedDashes}]  100%  [ OK ]`,
        timestamp: Date.now(),
      },
    ])
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  // Animation sequence on reload
  useEffect(() => {
    const targetCommand = 'welcome'
    let charIdx = 0

    // Step 1: Slower, deliberate intro typing (~135ms per keystroke)
    const typeNextChar = () => {
      if (charIdx < targetCommand.length) {
        charIdx++
        setTypedCommand(targetCommand.slice(0, charIdx))
        animTimerRef.current = setTimeout(typeNextChar, 135)
      } else {
        // Natural pause after typing finishes before execution
        animTimerRef.current = setTimeout(() => {
          setAnimPhase('streaming')
          streamNextLine(0)
        }, 350)
      }
    }

    // Step 2: Slower line-by-line welcome output stream (~65ms per line)
    const streamNextLine = (lineIdx: number) => {
      if (lineIdx < welcomeLines.current.length) {
        setStreamedLineIndex(lineIdx + 1)
        animTimerRef.current = setTimeout(() => {
          streamNextLine(lineIdx + 1)
        }, 65)
      } else {
        // Pause after text stream before Pacman loader begins
        animTimerRef.current = setTimeout(() => {
          setAnimPhase('loading-bar')
          startPacmanLoading(0)
        }, 300)
      }
    }

    // Step 3: Arch Linux Pacman ILoveCandy style loading animation
    const startPacmanLoading = (progress: number) => {
      if (progress < 100) {
        const step = Math.floor(Math.random() * 4) + 2
        const next = Math.min(100, progress + step)
        setLoadPercent(next)
        setChompState((prev) => !prev)

        animTimerRef.current = setTimeout(() => {
          startPacmanLoading(next)
        }, 55)
      } else {
        // When 100% reached, pause briefly so user sees [ OK ] before terminal appears smoothly
        animTimerRef.current = setTimeout(() => {
          finishWelcomeInstantly()
        }, 380)
      }
    }

    // Initial slight pause before typing starts
    animTimerRef.current = setTimeout(typeNextChar, 250)

    const handleSkip = () => {
      finishWelcomeInstantly()
    }

    window.addEventListener('keydown', handleSkip, { once: true })
    return () => {
      if (animTimerRef.current) {
        clearTimeout(animTimerRef.current)
      }
      window.removeEventListener('keydown', handleSkip)
    }
  }, [barLength])

  // Auto-scroll on any change during typing, streaming, or loading
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [entries, typedCommand, streamedLineIndex, loadPercent, animPhase])

  // Drag handlers: Hardware-accelerated dragging with touch-action: none on header
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return
    if (isMaximized || isMinimized) return

    e.preventDefault()
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: dragPos.x,
      initY: dragPos.y,
    }
    setIsDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStartRef.current.startX
    const deltaY = e.clientY - dragStartRef.current.startY

    // Safe bounds: ensure window cannot be lost completely off-screen
    const maxBoundX = Math.max(25, (window.innerWidth - 80) / 2)
    const maxBoundY = Math.max(25, (window.innerHeight - 80) / 2)

    const nextX = Math.max(-maxBoundX, Math.min(maxBoundX, dragStartRef.current.initX + deltaX))
    const nextY = Math.max(-maxBoundY, Math.min(maxBoundY, dragStartRef.current.initY + deltaY))

    setDragPos({ x: nextX, y: nextY })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore if pointer capture already lost
    }
    setIsDragging(false)
  }

  const handleCommandSubmit = (commandLine: string) => {
    const trimmed = commandLine.trim()
    if (!trimmed) {
      setEntries((prev) => [
        ...prev,
        {
          id: `entry-${Date.now()}-empty`,
          type: 'input',
          command: '',
          cwd: vfsRef.current.getPromptPath(),
          content: '',
          timestamp: Date.now(),
        },
      ])
      return
    }

    setIsLocked(true)
    setHistory((prev) => [...prev, trimmed])

    const currentPromptPath = vfsRef.current.getPromptPath()
    const parsed = CommandParser.parse(trimmed)

    const result = registryRef.current.execute(parsed, {
      vfs: vfsRef.current,
      history: [...history, trimmed],
      currentTheme: themeId,
      setTheme: (newTheme: string) => {
        if (THEMES[newTheme]) {
          setThemeId(newTheme)
          localStorage.setItem('terminal_theme', newTheme)
          return true
        }
        return false
      },
    })

    if (result.clear) {
      setEntries([])
      setIsLocked(false)
      return
    }

    const newEntries: TerminalEntry[] = [
      {
        id: `cmd-${Date.now()}`,
        type: 'input',
        command: trimmed,
        cwd: currentPromptPath,
        content: '',
        timestamp: Date.now(),
      },
    ]

    if (result.output) {
      newEntries.push({
        id: `out-${Date.now()}`,
        type: result.success ? 'output' : 'error',
        content: result.output,
        timestamp: Date.now() + 1,
      })
    }

    setEntries((prev) => [...prev, ...newEntries])
    setIsLocked(false)
  }

  const handleTabComplete = (currentInput: string) => {
    const parts = currentInput.split(' ')
    const lastWord = parts[parts.length - 1]

    if (parts.length === 1) {
      const allCommands = registryRef.current.getCommandNames()
      const matches = allCommands.filter((cmd) => cmd.startsWith(lastWord.toLowerCase()))
      if (matches.length === 1) {
        return { completed: matches[0] + ' ' }
      }
      return { completed: currentInput, matches }
    }

    const command = parts[0].toLowerCase()

    if (command === 'theme') {
      const themeNames = Object.keys(THEMES)
      const matches = themeNames.filter((t) => t.startsWith(lastWord.toLowerCase()))
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0]
        return { completed: parts.join(' ') }
      }
      return { completed: currentInput, matches }
    }

    if (command === 'project') {
      const projectNames = PROJECTS.map((p) => p.id)
      const matches = projectNames.filter((name) => name.startsWith(lastWord.toLowerCase()))
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0]
        return { completed: parts.join(' ') + ' ' }
      }
      return { completed: currentInput, matches }
    }

    if (['cat', 'cd', 'ls'].includes(command)) {
      const matches = vfsRef.current.getCompletions(lastWord)
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0]
        return { completed: parts.join(' ') }
      }
      return { completed: currentInput, matches }
    }

    return { completed: currentInput }
  }

  const currentlyStreamedText = welcomeLines.current
    .slice(0, streamedLineIndex)
    .join('\n')

  // Generate Arch Linux Pacman ILoveCandy progress bar representation
  const pacmanPos = Math.floor((loadPercent / 100) * barLength)
  const eatenDashes = '-'.repeat(Math.max(0, pacmanPos))
  const pacmanChar = chompState ? 'C' : 'c'

  // Food pellets ahead of Pacman
  let pelletsAhead = ''
  for (let i = pacmanPos + 1; i < barLength; i++) {
    if (i % 4 === 0) {
      pelletsAhead += 'o'
    } else {
      pelletsAhead += ' '
    }
  }

  const activeTheme = THEMES[themeId] || THEMES.default

  return (
    <div
      style={{
        '--bg-main': '#0D1117',
        '--term-surface': activeTheme.colors.termSurface,
        '--term-header': '#161B22',
        '--prompt-green': activeTheme.colors.promptGreen,
        '--command-cyan': activeTheme.colors.commandCyan,
        '--text-primary': activeTheme.colors.textPrimary,
        '--text-secondary': activeTheme.colors.textSecondary,
        '--term-border': '#30363D',
      } as React.CSSProperties}
      className="relative min-h-[100dvh] w-full flex items-center justify-center p-1 sm:p-4 md:p-6 bg-[#0D1117] text-[#E6EDF3] overflow-hidden select-none"
    >
      {/* Background center easter egg (revealed when user moves the terminal away from the center or minimizes) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <div
          onClick={() => setIsCheered((prev) => !prev)}
          className="pointer-events-auto font-mono text-xs cursor-pointer select-none flex items-center space-x-1.5 transition-all duration-200 hover:opacity-100 opacity-80 py-2 px-3"
          title="system message"
        >
          <span className="text-[#7EE787] font-bold select-none">~ $</span>
          <span className="text-[#8B949E] hover:text-[#7EE787] transition-colors">
            {isCheered ? 'you are doing better, keep up ;3' : 'hey ;)'}
          </span>
          <span className="inline-block w-1.5 h-3 bg-[#7EE787] cursor-blink align-middle" />
        </div>
      </div>

      {/* Minimized Docked Icon Only */}
      {isMinimized ? (
        <button
          onClick={() => {
            setIsMinimized(false)
            setTimeout(() => inputRef.current?.focus(), 150)
          }}
          className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-11 h-11 sm:w-12 sm:h-12 bg-[#161B22] border border-[#30363D] hover:border-[var(--prompt-green)] rounded-xl shadow-2xl cursor-pointer text-[var(--prompt-green)] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group"
          title="Restore terminal"
          aria-label="Restore terminal"
        >
          <CustomIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
        </button>
      ) : (
        /* Main Terminal Window */
        <main
          style={{
            transform: isMaximized
              ? 'translate3d(0, 0, 0)'
              : `translate3d(${dragPos.x}px, ${dragPos.y}px, 0)`,
            transition: isDragging
              ? 'none'
              : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease',
            willChange: 'transform',
          }}
          className={`bg-[var(--term-surface)] border border-[#30363D] rounded-lg sm:rounded-xl shadow-2xl flex flex-col overflow-hidden transition-colors duration-300 ${
            isMaximized
              ? 'fixed inset-1 sm:inset-4 z-50 w-[calc(100vw-0.5rem)] sm:w-[calc(100vw-2rem)] h-[calc(100dvh-0.5rem)] sm:h-[calc(100dvh-2rem)]'
              : 'w-full max-w-4xl h-[95dvh] sm:h-[85vh] min-h-[320px] sm:min-h-[460px]'
          }`}
          onClick={() => {
            if (animPhase !== 'done') {
              finishWelcomeInstantly()
            } else {
              inputRef.current?.focus()
            }
          }}
        >
          {/* Draggable Minimal Terminal Header with touchAction: none */}
          <header
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={() => setIsMaximized((prev) => !prev)}
            style={{ touchAction: 'none' }}
            className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#161B22] border-b border-[#30363D] select-none shrink-0 ${
              isMaximized ? 'cursor-default' : isDragging ? 'cursor-grabbing' : 'sm:cursor-grab cursor-default'
            }`}
          >
            {/* Control dots with accessible touch targets */}
            <div data-no-drag className="flex items-center space-x-1 sm:space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setEntries([])
                  finishWelcomeInstantly()
                }}
                className="p-1.5 -m-1 rounded-full focus:outline-none cursor-pointer flex items-center justify-center"
                title="Reset terminal"
                aria-label="Reset terminal"
              >
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F56] hover:opacity-80 active:opacity-60 block transition-opacity" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMinimized(true)
                }}
                className="p-1.5 -m-1 rounded-full focus:outline-none cursor-pointer flex items-center justify-center"
                title="Minimize window"
                aria-label="Minimize window"
              >
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E] hover:opacity-80 active:opacity-60 block transition-opacity" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMaximized((prev) => !prev)
                }}
                className="p-1.5 -m-1 rounded-full focus:outline-none cursor-pointer flex items-center justify-center"
                title={isMaximized ? 'Restore window' : 'Maximize window'}
                aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
              >
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27C93F] hover:opacity-80 active:opacity-60 block transition-opacity" />
              </button>
            </div>

            {/* Title / Hostname */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-xs text-[#8B949E] font-mono pointer-events-none truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
              <CustomIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--prompt-green)] shrink-0" />
              <span className="text-[#E6EDF3] font-medium truncate">
                sahid@portfolio:{vfsRef.current.getPromptPath()}
              </span>
            </div>

            {/* Right actions: Minimize & Maximize controls */}
            <div data-no-drag className="flex items-center space-x-0.5 sm:space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMinimized(true)
                }}
                className="p-1.5 sm:p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]/40 active:bg-[#21262D] transition-colors"
                title="Minimize"
                aria-label="Minimize"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMaximized((prev) => !prev)
                }}
                className="p-1.5 sm:p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]/40 active:bg-[#21262D] transition-colors"
                title={isMaximized ? 'Restore Window' : 'Maximize Window'}
                aria-label={isMaximized ? 'Restore Window' : 'Maximize Window'}
              >
                {isMaximized ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </header>

          {/* Pure Terminal Stream */}
          <div
            ref={terminalBodyRef}
            className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed select-text bg-[var(--term-surface)] text-[var(--text-primary)] transition-colors duration-300"
          >
            <div className="space-y-3 sm:space-y-4">
              {/* Standard Terminal Entries */}
              <TerminalOutput entries={entries} />

              {/* Step 1: Slower typing animation */}
              {animPhase === 'typing' && (
                <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-x-2 gap-y-1 font-mono text-xs sm:text-sm">
                  <span className="text-[var(--prompt-green)] font-bold select-none shrink-0">
                    sahid@portfolio:~$
                  </span>
                  <span className="text-[var(--command-cyan)] font-semibold flex items-center">
                    <span>{typedCommand}</span>
                    <span className="inline-block w-[7px] sm:w-[8.5px] h-[1.15em] bg-[var(--prompt-green)] cursor-blink align-text-bottom select-none ml-[1px]" />
                  </span>
                </div>
              )}

              {/* Step 2: Streaming welcome output */}
              {(animPhase === 'streaming' || animPhase === 'loading-bar') && (
                <div className="space-y-3 font-mono text-xs sm:text-sm">
                  <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-[var(--prompt-green)] font-bold select-none shrink-0">
                      sahid@portfolio:~$
                    </span>
                    <span className="text-[var(--command-cyan)] font-semibold">welcome</span>
                  </div>
                  <TerminalOutput
                    entries={[
                      {
                        id: 'streaming-preview',
                        type: 'output',
                        content: currentlyStreamedText,
                        timestamp: Date.now(),
                      },
                    ]}
                  />
                </div>
              )}

              {/* Step 3: Arch Linux Pacman ILoveCandy Loading Animation across window width */}
              {animPhase === 'loading-bar' && (
                <div className="pt-2 font-mono text-[11px] sm:text-sm whitespace-pre flex items-center overflow-x-hidden">
                  <span className="text-[var(--prompt-green)] font-bold">[</span>
                  {loadPercent < 100 ? (
                    <>
                      <span className="text-[var(--prompt-green)] font-bold">{eatenDashes}</span>
                      <span className="text-[#F2CC60] font-bold">{pacmanChar}</span>
                      <span className="text-[var(--text-secondary)] tracking-wider">{pelletsAhead}</span>
                    </>
                  ) : (
                    <span className="text-[var(--prompt-green)] font-bold">{'-'.repeat(barLength)}</span>
                  )}
                  <span className="text-[var(--prompt-green)] font-bold">]</span>
                  <span className="text-[var(--command-cyan)] font-bold ml-1.5 sm:ml-2.5">
                    {String(loadPercent).padStart(3, ' ')}%
                  </span>
                  {loadPercent === 100 && (
                    <span className="text-[var(--prompt-green)] font-bold ml-1.5 sm:ml-2">[ OK ]</span>
                  )}
                </div>
              )}

              {/* Step 4: Shell terminal prompt appears smoothly/slowly */}
              {animPhase === 'done' && (
                <div className="animate-fade-slow">
                  <TerminalInput
                    inputRef={inputRef}
                    promptPath={vfsRef.current.getPromptPath()}
                    onSubmit={handleCommandSubmit}
                    onTabComplete={handleTabComplete}
                    history={history}
                    isLocked={isLocked}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
