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

  // Shell typing animation state on reload
  const [isTypingWelcome, setIsTypingWelcome] = useState<boolean>(true)
  const [typedCommand, setTypedCommand] = useState<string>('')

  const vfsRef = useRef<VirtualFileSystem>(new VirtualFileSystem())
  const registryRef = useRef<CommandRegistry>(new CommandRegistry())
  const terminalBodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const finishWelcome = () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }
    setIsTypingWelcome(false)
    setEntries([
      {
        id: 'welcome-input',
        type: 'input',
        command: 'welcome',
        cwd: '~',
        content: '',
        timestamp: Date.now() - 100,
      },
      {
        id: 'welcome-output',
        type: 'output',
        content: WELCOME_TEXT,
        timestamp: Date.now(),
      },
    ])
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // Reload typing animation
  useEffect(() => {
    const target = 'welcome'
    let currentIdx = 0

    const typeNextChar = () => {
      if (currentIdx < target.length) {
        currentIdx++
        setTypedCommand(target.slice(0, currentIdx))
        typingTimerRef.current = setTimeout(typeNextChar, 75)
      } else {
        // Pausing briefly to simulate pressing Enter
        typingTimerRef.current = setTimeout(() => {
          finishWelcome()
        }, 220)
      }
    }

    // Initial brief delay before typing begins
    typingTimerRef.current = setTimeout(typeNextChar, 250)

    const handleSkip = () => {
      finishWelcome()
    }

    window.addEventListener('keydown', handleSkip, { once: true })
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
      window.removeEventListener('keydown', handleSkip)
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [entries, typedCommand, isTypingWelcome])

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

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#0D1117]">
      <main
        className={`w-full transition-all duration-200 bg-[#15181E] border border-[#30363D] rounded-xl shadow-2xl flex flex-col overflow-hidden ${
          isMaximized ? 'fixed inset-2 z-50 h-[calc(100vh-1rem)]' : 'max-w-4xl h-[85vh] min-h-[550px]'
        }`}
        onClick={() => {
          if (isTypingWelcome) {
            finishWelcome()
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
                finishWelcome()
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
            <TerminalOutput entries={entries} />

            {/* Simulated typing on reload */}
            {isTypingWelcome ? (
              <div className="flex items-center space-x-2 font-mono text-sm">
                <span className="text-[#7EE787] font-bold select-none shrink-0">
                  sahid@portfolio:~$
                </span>
                <span className="text-[#79C0FF] font-semibold">
                  {typedCommand}
                  <span className="inline-block w-2 h-4 bg-[#7EE787] cursor-blink align-middle ml-0.5" />
                </span>
              </div>
            ) : (
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
