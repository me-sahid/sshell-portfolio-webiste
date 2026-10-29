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

  const beforeCursor = value.slice(0, cursorPos)
  const charAtCursor = value[cursorPos]
  const afterCursor = value.slice(cursorPos + 1)

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
                const newVal = parts.join(' ')
                setValue(newVal)
                setCursorPos(newVal.length)
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

      <div
        className="flex items-center space-x-2 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <span className="text-[#7EE787] font-bold select-none shrink-0">
          sahid@portfolio:{promptPath}$
        </span>

        <div className="relative flex-1 flex items-center min-h-[1.5rem]">
          {/* Visual text with bold fat VS Code style block blinker */}
          <div className="font-mono text-sm pointer-events-none select-none flex items-center whitespace-pre leading-none">
            <span className="text-[#E6EDF3]">{beforeCursor}</span>
            {isFocused && (
              charAtCursor !== undefined ? (
                <span className="bg-[#7EE787] text-[#15181E] font-bold cursor-blink inline-block px-[0.5px]">
                  {charAtCursor}
                </span>
              ) : (
                <span className="inline-block w-[8.5px] h-[1.15em] bg-[#7EE787] cursor-blink align-text-bottom select-none" />
              )
            )}
            <span className="text-[#E6EDF3]">{afterCursor}</span>
          </div>

          {/* Actual transparent input taking focus and keystrokes */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setCursorPos(e.target.selectionStart ?? e.target.value.length)
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={syncCursor}
            onClick={syncCursor}
            onSelect={syncCursor}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="absolute inset-0 w-full bg-transparent border-none outline-none text-transparent caret-transparent p-0 text-sm font-mono"
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
