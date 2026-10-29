import React, { useState, useRef, useEffect } from 'react'

interface TerminalInputProps {
  promptPath: string
  onSubmit: (command: string) => void
  onTabComplete: (currentInput: string) => { completed: string; matches?: string[] }
  history: string[]
  inputRef?: React.RefObject<HTMLInputElement | null>
  isLocked?: boolean
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  promptPath,
  onSubmit,
  onTabComplete,
  history,
  inputRef: externalInputRef,
  isLocked = false,
}) => {
  const [value, setValue] = useState('')
  const [cursorPos, setCursorPos] = useState<number>(0)
  const [isFocused, setIsFocused] = useState<boolean>(true)
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [completionSuggestions, setCompletionSuggestions] = useState<string[]>([])
  const internalInputRef = useRef<HTMLInputElement>(null)
  const inputRef = externalInputRef || internalInputRef

  // Keep input focused automatically
  useEffect(() => {
    inputRef.current?.focus()
  }, [inputRef])

  const syncCursor = () => {
    requestAnimationFrame(() => {
      if (inputRef.current) {
        setCursorPos(inputRef.current.selectionStart ?? inputRef.current.value.length)
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isLocked) {
      e.preventDefault()
      return
    }

    // Enter
    if (e.key === 'Enter') {
      e.preventDefault()
      const toSubmit = value
      setValue('')
      setCursorPos(0)
      setHistoryIndex(-1)
      setCompletionSuggestions([])
      onSubmit(toSubmit)
      return
    }

    // Up Arrow: History backward
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return

      let nextIndex = historyIndex + 1
      if (nextIndex >= history.length) {
        nextIndex = history.length - 1
      }
      setHistoryIndex(nextIndex)
      const histCmd = history[history.length - 1 - nextIndex]
      if (histCmd !== undefined) {
        setValue(histCmd)
        setCursorPos(histCmd.length)
      }
      return
    }

    // Down Arrow: History forward
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex <= 0) {
        setHistoryIndex(-1)
        setValue('')
        setCursorPos(0)
        return
      }
      const nextIndex = historyIndex - 1
      setHistoryIndex(nextIndex)
      const histCmd = history[history.length - 1 - nextIndex]
      if (histCmd !== undefined) {
        setValue(histCmd)
        setCursorPos(histCmd.length)
      }
      return
    }

    // Tab: Autocompletion
    if (e.key === 'Tab') {
      e.preventDefault()
      if (!value.trim()) return

      const { completed, matches } = onTabComplete(value)
      if (completed) {
        setValue(completed)
        setCursorPos(completed.length)
      }
      if (matches && matches.length > 1) {
        setCompletionSuggestions(matches)
      } else {
        setCompletionSuggestions([])
      }
      return
    }

    // Clear suggestions on other keys
    if (completionSuggestions.length > 0) {
      setCompletionSuggestions([])
    }

    syncCursor()
  }

  // Mobile helpers for touchscreens
  const handleTabAction = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (!value.trim()) return

    const { completed, matches } = onTabComplete(value)
    if (completed) {
      setValue(completed)
      setCursorPos(completed.length)
    }
    if (matches && matches.length > 1) {
      setCompletionSuggestions(matches)
    } else {
      setCompletionSuggestions([])
    }
    inputRef.current?.focus()
  }

  const handleHistoryUp = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (history.length === 0) return

    let nextIndex = historyIndex + 1
    if (nextIndex >= history.length) {
      nextIndex = history.length - 1
    }
    setHistoryIndex(nextIndex)
    const histCmd = history[history.length - 1 - nextIndex]
    if (histCmd !== undefined) {
      setValue(histCmd)
      setCursorPos(histCmd.length)
    }
    inputRef.current?.focus()
  }

  const handleHistoryDown = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (historyIndex <= 0) {
      setHistoryIndex(-1)
      setValue('')
      setCursorPos(0)
      inputRef.current?.focus()
      return
    }
    const nextIndex = historyIndex - 1
    setHistoryIndex(nextIndex)
    const histCmd = history[history.length - 1 - nextIndex]
    if (histCmd !== undefined) {
      setValue(histCmd)
      setCursorPos(histCmd.length)
    }
    inputRef.current?.focus()
  }

  const handleQuickCommand = (cmd: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setValue('')
    setCursorPos(0)
    setHistoryIndex(-1)
    setCompletionSuggestions([])
    onSubmit(cmd)
    inputRef.current?.focus()
  }

  const beforeCursor = value.slice(0, cursorPos)
  const charAtCursor = value[cursorPos]
  const afterCursor = value.slice(cursorPos + 1)

  return (
    <div className="mt-2 font-mono text-xs sm:text-sm">
      {completionSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 p-2 rounded bg-[var(--term-header)] border border-[var(--term-border)] text-[11px] sm:text-xs text-[var(--command-cyan)]">
          <span className="text-[var(--text-secondary)] select-none">Suggestions:</span>
          {completionSuggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const parts = value.split(' ')
                parts[parts.length - 1] = s
                const newVal = parts.join(' ')
                setValue(newVal)
                setCursorPos(newVal.length)
                setCompletionSuggestions([])
                inputRef.current?.focus()
              }}
              className="cursor-pointer hover:underline text-[var(--prompt-green)] px-1 py-0.5 rounded bg-[var(--term-surface)] hover:bg-[var(--term-border)] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div
        className="flex flex-wrap sm:flex-nowrap items-baseline gap-x-2 gap-y-1 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <span className="text-[var(--prompt-green)] font-bold select-none shrink-0 text-xs sm:text-sm">
          sahid@portfolio:{promptPath}$
        </span>

        <div className="relative flex-1 flex items-center min-w-[120px] min-h-[1.5rem]">
          {/* Visual text with bold fat VS Code style block blinker */}
          <div className="font-mono text-xs sm:text-sm pointer-events-none select-none flex items-center whitespace-pre leading-none break-all">
            <span className="text-[var(--text-primary)]">{beforeCursor}</span>
            {isFocused && (
              charAtCursor !== undefined ? (
                <span className="bg-[var(--prompt-green)] text-[var(--term-surface)] font-bold cursor-blink inline-block px-[0.5px]">
                  {charAtCursor}
                </span>
              ) : (
                <span className="inline-block w-[7px] sm:w-[8.5px] h-[1.15em] bg-[var(--prompt-green)] cursor-blink align-text-bottom select-none" />
              )
            )}
            <span className="text-[var(--text-primary)]">{afterCursor}</span>
          </div>

          {/* Actual transparent input taking focus and keystrokes (text-base on mobile prevents iOS zoom) */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              // Sanitize smart quotes/dashes often inserted by mobile keyboards
              const sanitized = e.target.value
                .replace(/[\u2018\u2019]/g, "'")
                .replace(/[\u201C\u201D]/g, '"')
                .replace(/[\u2013\u2014]/g, '--')
              setValue(sanitized)
              setCursorPos(e.target.selectionStart ?? sanitized.length)
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={syncCursor}
            onClick={syncCursor}
            onSelect={syncCursor}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="absolute inset-0 w-full bg-transparent border-none outline-none text-transparent caret-transparent p-0 text-base sm:text-sm font-mono"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            aria-label="Terminal command prompt"
          />
        </div>
      </div>

      {/* Mobile-Friendly Linux Terminal Auxiliary Toolbar */}
      <div className="flex sm:hidden flex-wrap items-center justify-between gap-1.5 pt-2.5 pb-0.5 border-t border-[var(--term-border)]/40 mt-3 select-none">
        {/* Terminal Keys: Tab, History Up, History Down, Clear */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleTabAction}
            className="px-2 py-1 bg-[var(--term-header)] active:bg-[var(--term-border)] border border-[var(--term-border)] rounded text-[11px] font-mono font-medium text-[var(--command-cyan)] active:scale-95 transition-all"
            title="Tab autocompletion"
          >
            Tab
          </button>
          <button
            type="button"
            onClick={handleHistoryUp}
            className="px-2 py-1 bg-[var(--term-header)] active:bg-[var(--term-border)] border border-[var(--term-border)] rounded text-[11px] font-mono text-[var(--text-secondary)] active:text-[var(--prompt-green)] active:scale-95 transition-all"
            title="Previous command in history"
            aria-label="Previous command"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={handleHistoryDown}
            className="px-2 py-1 bg-[var(--term-header)] active:bg-[var(--term-border)] border border-[var(--term-border)] rounded text-[11px] font-mono text-[var(--text-secondary)] active:text-[var(--prompt-green)] active:scale-95 transition-all"
            title="Next command in history"
            aria-label="Next command"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={(e) => handleQuickCommand('clear', e)}
            className="px-2 py-1 bg-[var(--term-header)] active:bg-[var(--term-border)] border border-[var(--term-border)] rounded text-[11px] font-mono text-[var(--text-secondary)] active:text-[var(--text-primary)] active:scale-95 transition-all"
            title="Clear terminal screen"
          >
            clear
          </button>
        </div>

        {/* Quick Command Chips */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 max-w-full">
          {['help', 'projects', 'skills', 'education', 'theme'].map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={(e) => handleQuickCommand(cmd, e)}
              className="px-2 py-1 bg-[var(--term-header)]/90 hover:bg-[var(--term-header)] active:bg-[var(--term-border)] border border-[var(--term-border)]/70 rounded text-[11px] font-mono text-[var(--prompt-green)] shrink-0 active:scale-95 transition-all"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
