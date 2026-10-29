import React, { useState, useEffect, useRef } from 'react'
import { VirtualFileSystem } from '../services/VirtualFileSystem'
import { CommandRegistry } from '../services/CommandRegistry'
import { CommandParser } from '../services/CommandParser'
import type { TerminalEntry } from '../data/types'
import { PROJECTS, IDENTITY } from '../data/portfolioData'
import { BootSequence } from './BootSequence'
import { TerminalInput } from './TerminalInput'
import { TerminalOutput } from './TerminalOutput'
import { Terminal, Maximize2, Minimize2 } from 'lucide-react'

export const TerminalWindow: React.FC = () => {
  const [hasBooted, setHasBooted] = useState<boolean>(() => {
    return sessionStorage.getItem('portfolio_booted') === 'true'
  })
  const [entries, setEntries] = useState<TerminalEntry[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [isMaximized, setIsMaximized] = useState<boolean>(false)

  const vfsRef = useRef<VirtualFileSystem>(new VirtualFileSystem())
  const registryRef = useRef<CommandRegistry>(new CommandRegistry())
  const terminalBodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize initial terminal entries after boot
  const initTerminalOutput = () => {
    const initialEntries: TerminalEntry[] = [
      {
        id: 'init-whoami-cmd',
        type: 'input',
        command: 'whoami',
        cwd: '~',
        content: '',
        timestamp: Date.now() - 2000,
      },
      {
        id: 'init-whoami-out',
        type: 'output',
        content: `${IDENTITY.name}\n${IDENTITY.shortIdentity}\nFocus: ${IDENTITY.focus}`,
        timestamp: Date.now() - 1900,
      },
      {
        id: 'init-help-cmd',
        type: 'input',
        command: 'help',
        cwd: '~',
        content: '',
        timestamp: Date.now() - 1000,
      },
      {
        id: 'init-help-out',
        type: 'output',
        content: [
          'help         Show available commands',
          'whoami       Display my identity',
          'about        Learn about my background and interests',
          'projects     List my projects',
          'project NAME Inspect a specific project',
          'skills       Display my technical stack',
          'education    Display my education and CGPA',
          'achievements Display hackathons and academic achievements',
          'resume       View or download my resume',
          'contact      Display contact information',
          'github       Open my GitHub profile',
          'linkedin     Open my LinkedIn profile',
          'clear        Clear terminal output',
          'ls           List virtual portfolio files',
          'pwd          Display the virtual working directory',
          'cd PATH      Navigate the virtual directory',
          'cat FILE     Display a supported portfolio file',
          'history      Display commands entered in this session',
          'date         Display the current date and time',
          'neofetch     Display a portfolio summary',
          'banner       Display a small ASCII wordmark',
          '',
          'Tip: Type a command below. Use ↑ / ↓ for command history and Tab for completion.',
        ].join('\n'),
        timestamp: Date.now(),
      },
    ]

    setEntries(initialEntries)
  }

  useEffect(() => {
    if (hasBooted && entries.length === 0) {
      initTerminalOutput()
    }
  }, [hasBooted])

  // Scroll to bottom when entries change
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [entries])

  const handleBootComplete = () => {
    sessionStorage.setItem('portfolio_booted', 'true')
    setHasBooted(true)
    initTerminalOutput()
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

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#0D1117]">
      <main
        className={`w-full transition-all duration-200 bg-[#15181E] border border-[#30363D] rounded-xl shadow-2xl flex flex-col overflow-hidden ${
          isMaximized ? 'fixed inset-2 z-50 h-[calc(100vh-1rem)]' : 'max-w-4xl h-[85vh] min-h-[550px]'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Minimal Terminal Header */}
        <header className="flex items-center justify-between px-4 py-2.5 bg-[#161B22] border-b border-[#30363D] select-none shrink-0">
          <div className="flex items-center space-x-2">
            <span
              onClick={() => {
                setEntries([])
                initTerminalOutput()
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
            <Terminal className="w-3.5 h-3.5 text-[#7EE787]" />
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

        {/* Pure Command Terminal Stream */}
        <div
          ref={terminalBodyRef}
          className="flex-1 p-4 md:p-6 overflow-y-auto font-mono text-sm leading-relaxed"
        >
          {!hasBooted ? (
            <BootSequence onComplete={handleBootComplete} />
          ) : (
            <div className="space-y-4">
              <TerminalOutput entries={entries} />
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
      </main>
    </div>
  )
}
