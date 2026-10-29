import React, { useState, useEffect, useRef } from 'react'
import { VirtualFileSystem } from '../services/VirtualFileSystem'
import { CommandRegistry } from '../services/CommandRegistry'
import { CommandParser } from '../services/CommandParser'
import type { TerminalEntry } from '../data/types'
import { PROJECTS, WELCOME_TEXT } from '../data/portfolioData'
import { TerminalInput } from './TerminalInput'
import { TerminalOutput } from './TerminalOutput'
import { CustomIcon } from './CustomIcon'
import { Maximize2, Minimize2 } from 'lucide-react'

export const TerminalWindow: React.FC = () => {
  const [entries, setEntries] = useState<TerminalEntry[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [isMaximized, setIsMaximized] = useState<boolean>(false)

  // Animation states: 'typing' -> 'streaming' -> 'done'
  const [animPhase, setAnimPhase] = useState<'typing' | 'streaming' | 'done'>('typing')
  const [typedCommand, setTypedCommand] = useState<string>('')
  const [streamedLineIndex, setStreamedLineIndex] = useState<number>(0)

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
        timestamp: Date.now() - 100,
      },
      {
        id: 'welcome-out',
        type: 'output',
        content: WELCOME_TEXT,
        timestamp: Date.now(),
      },
    ])
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // Sequential boot typing and apt-get update style line streaming
  useEffect(() => {
    const targetCommand = 'welcome'
    let charIdx = 0

    // Step 1: Realistic typing keystroke by keystroke (fast and snappy)
    const typeNextChar = () => {
      if (charIdx < targetCommand.length) {
        charIdx++
        setTypedCommand(targetCommand.slice(0, charIdx))
        animTimerRef.current = setTimeout(typeNextChar, 55)
      } else {
        // Quick natural pause after typing before executing
        animTimerRef.current = setTimeout(() => {
          setAnimPhase('streaming')
          streamNextLine(0)
        }, 180)
      }
    }

    // Step 2: Line by line output stream like system booting / apt-get update
    const streamNextLine = (lineIdx: number) => {
      if (lineIdx < welcomeLines.current.length) {
        setStreamedLineIndex(lineIdx + 1)
        // Snappy terminal stdout stream
        animTimerRef.current = setTimeout(() => {
          streamNextLine(lineIdx + 1)
        }, 42)
      } else {
        animTimerRef.current = setTimeout(() => {
          finishWelcomeInstantly()
        }, 100)
      }
    }

    // Initial slight pause before typing starts
    animTimerRef.current = setTimeout(typeNextChar, 150)

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

  // Auto-scroll on any change during typing or streaming
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [entries, typedCommand, streamedLineIndex, animPhase])

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

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#0D1117]">
      <main
        className={`w-full transition-all duration-200 bg-[#15181E] border border-[#30363D] rounded-xl shadow-2xl flex flex-col overflow-hidden ${
          isMaximized ? 'fixed inset-2 z-50 h-[calc(100vh-1rem)]' : 'max-w-4xl h-[85vh] min-h-[550px]'
        }`}
        onClick={() => {
          if (animPhase !== 'done') {
            finishWelcomeInstantly()
          } else {
            inputRef.current?.focus()
          }
        }}
      >
        {/* Minimal Terminal Header */}
        <header className="flex items-center justify-between px-4 py-2.5 bg-[#161B22] border-b border-[#30363D] select-none shrink-0">
          <div className="flex items-center space-x-2">
            <span
              onClick={() => {
                setEntries([])
                finishWelcomeInstantly()
              }}
              className="w-3 h-3 rounded-full bg-[#FF5F56] hover:opacity-80 cursor-pointer inline-block"
              title="Reset terminal"
            />
            <span
              onClick={() => setIsMaximized((prev) => !prev)}
              className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:opacity-80 cursor-pointer inline-block"
              title="Toggle size"
            />
            <span
              onClick={() => setIsMaximized((prev) => !prev)}
              className="w-3 h-3 rounded-full bg-[#27C93F] hover:opacity-80 cursor-pointer inline-block"
              title="Maximize"
            />
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-[#8B949E] font-mono">
            <CustomIcon className="w-3.5 h-3.5 text-[#7EE787]" />
            <span className="text-[#E6EDF3] font-medium">
              sahid@portfolio:{vfsRef.current.getPromptPath()}
            </span>
          </div>

          <div className="flex items-center space-x-2">
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
          className="flex-1 p-4 md:p-6 overflow-y-auto font-mono text-sm leading-relaxed"
        >
          <div className="space-y-4">
            {/* Standard Terminal Entries */}
            <TerminalOutput entries={entries} />

            {/* In-progress typing & streaming animation */}
            {animPhase === 'typing' && (
              <div className="flex items-center space-x-2 font-mono text-sm">
                <span className="text-[#7EE787] font-bold select-none shrink-0">
                  sahid@portfolio:~$
                </span>
                <span className="text-[#79C0FF] font-semibold flex items-center">
                  <span>{typedCommand}</span>
                  {/* VS Code bold fat block cursor moving right with typing */}
                  <span className="inline-block w-[8.5px] h-[1.15em] bg-[#7EE787] cursor-blink align-text-bottom select-none ml-[1px]" />
                </span>
              </div>
            )}

            {animPhase === 'streaming' && (
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-[#7EE787] font-bold select-none shrink-0">
                    sahid@portfolio:~$
                  </span>
                  <span className="text-[#79C0FF] font-semibold">welcome</span>
                </div>
                {/* Lines streaming in sequentially like apt-get update */}
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

            {/* Live Interactive Command Prompt */}
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
    </div>
  )
}
