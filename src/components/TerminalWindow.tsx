import React, { useState, useEffect, useRef } from 'react'
import { VirtualFileSystem } from '../services/VirtualFileSystem'
import { CommandRegistry } from '../services/CommandRegistry'
import { CommandParser } from '../services/CommandParser'
import type { TerminalEntry } from '../data/types'
import { PROJECTS, WELCOME_TEXT } from '../data/portfolioData'
import { TerminalInput } from './TerminalInput'
import { TerminalOutput } from './TerminalOutput'
import { CustomIcon } from './CustomIcon'
import { Maximize2, Minimize2, Minus } from 'lucide-react'

export const TerminalWindow: React.FC = () => {
  const [entries, setEntries] = useState<TerminalEntry[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [isLocked, setIsLocked] = useState<boolean>(false)

  // Window management states: normal, maximized, minimized, dragging
  const [isMaximized, setIsMaximized] = useState<boolean>(false)
  const [isMinimized, setIsMinimized] = useState<boolean>(false)
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)

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

  const vfsRef = useRef<VirtualFileSystem>(new VirtualFileSystem())
  const registryRef = useRef<CommandRegistry>(new CommandRegistry())
  const terminalBodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const welcomeLines = useRef<string[]>(WELCOME_TEXT.split('\n'))

  const finishWelcomeInstantly = () => {
    if (animTimerRef.current) {
      clearTimeout(animTimerRef.current)
    }
    setAnimPhase('done')
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
        id: 'welcome-loader',
        type: 'output',
        content: 'Loading interactive shell: [██████████████████████████████] 100% [ OK ]',
        timestamp: Date.now(),
      },
    ])
    setTimeout(() => inputRef.current?.focus(), 60)
  }

  // Animation sequence on reload
  useEffect(() => {
    const targetCommand = 'welcome'
    let charIdx = 0

    // Step 1: Deliberate, slower typing keystroke by keystroke (~115ms)
    const typeNextChar = () => {
      if (charIdx < targetCommand.length) {
        charIdx++
        setTypedCommand(targetCommand.slice(0, charIdx))
        animTimerRef.current = setTimeout(typeNextChar, 115)
      } else {
        // Natural pause after typing finishes before execution
        animTimerRef.current = setTimeout(() => {
          setAnimPhase('streaming')
          streamNextLine(0)
        }, 300)
      }
    }

    // Step 2: Line by line welcome output stream
    const streamNextLine = (lineIdx: number) => {
      if (lineIdx < welcomeLines.current.length) {
        setStreamedLineIndex(lineIdx + 1)
        animTimerRef.current = setTimeout(() => {
          streamNextLine(lineIdx + 1)
        }, 45)
      } else {
        // Pause after text output before Linux loading bar begins
        animTimerRef.current = setTimeout(() => {
          setAnimPhase('loading-bar')
          startLoadingBar(0)
        }, 220)
      }
    }

    // Step 3: Linux-style progress bar animation (~1.3s total)
    const startLoadingBar = (progress: number) => {
      if (progress < 100) {
        const next = Math.min(100, progress + Math.floor(Math.random() * 8) + 4)
        setLoadPercent(next)
        animTimerRef.current = setTimeout(() => {
          startLoadingBar(next)
        }, 45)
      } else {
        // Pause briefly at 100% before the user shell prompt appears
        animTimerRef.current = setTimeout(() => {
          finishWelcomeInstantly()
        }, 300)
      }
    }

    // Initial slight pause before typing starts
    animTimerRef.current = setTimeout(typeNextChar, 200)

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
  }, [])

  // Auto-scroll on any change during typing, streaming, or loading
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [entries, typedCommand, streamedLineIndex, loadPercent, animPhase])

  // Drag handlers using Pointer Events with Pointer Capture
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

    const maxBoundX = window.innerWidth / 2 - 50
    const maxBoundY = window.innerHeight / 2 - 50

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

  const totalBarBlocks = 30
  const filledBlocks = Math.round((loadPercent / 100) * totalBarBlocks)

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#0D1117] overflow-hidden select-none">
      {/* Minimized Docked Icon Only */}
      {isMinimized ? (
        <button
          onClick={() => {
            setIsMinimized(false)
            setTimeout(() => inputRef.current?.focus(), 150)
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-12 h-12 bg-[#161B22] border border-[#30363D] hover:border-[#7EE787] rounded-xl shadow-2xl cursor-pointer text-[#7EE787] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group"
          title="Restore terminal"
          aria-label="Restore terminal"
        >
          <CustomIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
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
              : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
          className={`bg-[#15181E] border border-[#30363D] rounded-xl shadow-2xl flex flex-col overflow-hidden ${
            isMaximized
              ? 'fixed inset-2 md:inset-4 z-50 w-[calc(100vw-1rem)] md:w-[calc(100vw-2rem)] h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)]'
              : 'w-full max-w-4xl h-[85vh] min-h-[550px]'
          }`}
          onClick={() => {
            if (animPhase !== 'done') {
              finishWelcomeInstantly()
            } else {
              inputRef.current?.focus()
            }
          }}
        >
          {/* Draggable Minimal Terminal Header */}
          <header
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={() => setIsMaximized((prev) => !prev)}
            className={`flex items-center justify-between px-4 py-2.5 bg-[#161B22] border-b border-[#30363D] select-none shrink-0 ${
              isMaximized ? 'cursor-default' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Control dots */}
            <div data-no-drag className="flex items-center space-x-2">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  setEntries([])
                  finishWelcomeInstantly()
                }}
                className="w-3 h-3 rounded-full bg-[#FF5F56] hover:opacity-80 cursor-pointer inline-block transition-opacity"
                title="Reset terminal"
              />
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMinimized(true)
                }}
                className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:opacity-80 cursor-pointer inline-block transition-opacity"
                title="Minimize window"
              />
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMaximized((prev) => !prev)
                }}
                className="w-3 h-3 rounded-full bg-[#27C93F] hover:opacity-80 cursor-pointer inline-block transition-opacity"
                title={isMaximized ? 'Restore window' : 'Maximize window'}
              />
            </div>

            {/* Title / Hostname */}
            <div className="flex items-center space-x-1.5 text-xs text-[#8B949E] font-mono pointer-events-none">
              <CustomIcon className="w-3.5 h-3.5 text-[#7EE787]" />
              <span className="text-[#E6EDF3] font-medium">
                sahid@portfolio:{vfsRef.current.getPromptPath()}
              </span>
            </div>

            {/* Right actions: Minimize & Maximize controls */}
            <div data-no-drag className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMinimized(true)
                }}
                className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors"
                title="Minimize"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMaximized((prev) => !prev)
                }}
                className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors"
                title={isMaximized ? 'Restore Window' : 'Maximize Window'}
              >
                {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </header>

          {/* Pure Terminal Stream */}
          <div
            ref={terminalBodyRef}
            className="flex-1 p-4 md:p-6 overflow-y-auto font-mono text-sm leading-relaxed select-text"
          >
            <div className="space-y-4">
              {/* Standard Terminal Entries */}
              <TerminalOutput entries={entries} />

              {/* Step 1: Slower typing animation */}
              {animPhase === 'typing' && (
                <div className="flex items-center space-x-2 font-mono text-sm">
                  <span className="text-[#7EE787] font-bold select-none shrink-0">
                    sahid@portfolio:~$
                  </span>
                  <span className="text-[#79C0FF] font-semibold flex items-center">
                    <span>{typedCommand}</span>
                    <span className="inline-block w-[8.5px] h-[1.15em] bg-[#7EE787] cursor-blink align-text-bottom select-none ml-[1px]" />
                  </span>
                </div>
              )}

              {/* Step 2: Streaming welcome output */}
              {(animPhase === 'streaming' || animPhase === 'loading-bar') && (
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#7EE787] font-bold select-none shrink-0">
                      sahid@portfolio:~$
                    </span>
                    <span className="text-[#79C0FF] font-semibold">welcome</span>
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

              {/* Step 3: Linux-style progress loading bar before prompt appears */}
              {animPhase === 'loading-bar' && (
                <div className="pt-2 font-mono text-xs sm:text-sm space-y-1">
                  <div className="flex items-center space-x-2 text-[#8B949E]">
                    <span className="text-[#7EE787] font-bold">system:</span>
                    <span>loading interactive shell environment...</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#7EE787] font-bold">[</span>
                    <span className="text-[#7EE787] tracking-tighter">
                      {'█'.repeat(filledBlocks)}
                    </span>
                    <span className="text-[#30363D] tracking-tighter">
                      {'░'.repeat(Math.max(0, totalBarBlocks - filledBlocks))}
                    </span>
                    <span className="text-[#7EE787] font-bold">]</span>
                    <span className="text-[#79C0FF] font-bold w-12">{loadPercent}%</span>
                    {loadPercent === 100 && (
                      <span className="text-[#7EE787] font-bold">[ OK ]</span>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Shell terminal prompt where user inputs appears after loading bar */}
              {animPhase === 'done' && (
                <TerminalInput
                  inputRef={inputRef}
                  promptPath={vfsRef.current.getPromptPath()}
                  onSubmit={handleCommandSubmit}
                  onTabComplete={handleTabComplete}
                  history={history}
                  isLocked={isLocked}
                />
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
