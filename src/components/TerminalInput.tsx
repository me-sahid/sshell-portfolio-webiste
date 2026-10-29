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
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [completionSuggestions, setCompletionSuggestions] = useState<string[]>([])
  const internalInputRef = useRef<HTMLInputElement>(null)
  const inputRef = externalInputRef || internalInputRef

  // Keep input focused automatically
  useEffect(() => {
    inputRef.current?.focus()
  }, [inputRef])

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
      // history is stored chronologically, so latest is at history.length - 1
      const histCmd = history[history.length - 1 - nextIndex]
      if (histCmd !== undefined) {
        setValue(histCmd)
      }
      return
    }

    // Down Arrow: History forward
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex <= 0) {
        setHistoryIndex(-1)
        setValue('')
        return
      }
      const nextIndex = historyIndex - 1
      setHistoryIndex(nextIndex)
      const histCmd = history[history.length - 1 - nextIndex]
      if (histCmd !== undefined) {
        setValue(histCmd)
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
      }
      if (matches && matches.length > 1) {
        setCompletionSuggestions(matches)
      } else {
        setCompletionSuggestions([])
      }
      return
    }

    // Any other key clears tab suggestions
    if (completionSuggestions.length > 0) {
      setCompletionSuggestions([])
    }
  }

  return (
    <div className="mt-2 font-mono text-sm">
      {completionSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 rounded bg-[#161B22] border border-[#30363D] text-xs text-[#79C0FF]">
          <span className="text-[#8B949E]">Suggestions:</span>
          {completionSuggestions.map((s, idx) => (
            <span
              key={idx}
              onClick={() => {
                const parts = value.split(' ')
                parts[parts.length - 1] = s
                setValue(parts.join(' '))
                setCompletionSuggestions([])
                inputRef.current?.focus()
              }}
              className="cursor-pointer hover:underline text-[#7EE787]"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <span className="text-[#7EE787] font-bold select-none shrink-0">
          sahid@portfolio:{promptPath}$
        </span>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-[#E6EDF3] font-mono caret-[#7EE787] p-0 text-sm"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            aria-label="Terminal command prompt"
          />
        </div>
      </div>
    </div>
  )
}
