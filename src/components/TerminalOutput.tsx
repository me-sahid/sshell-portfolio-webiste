import React from 'react'
import type { TerminalEntry } from '../data/types'

interface TerminalOutputProps {
  entries: TerminalEntry[]
}

function renderContentWithLinks(text: string) {
  // Regex to detect urls
  const urlRegex = /(https?:\/\/[^\s]+|\/Sahid_Al_Hassan_Resume\.pdf)/g

  const parts: (string | React.ReactNode)[] = []
  let lastIndex = 0
  let match

  while ((match = urlRegex.exec(text)) !== null) {
    const start = match.index
    const end = urlRegex.lastIndex
    const url = match[0]

    if (start > lastIndex) {
      parts.push(text.substring(lastIndex, start))
    }

    const isPdf = url.endsWith('.pdf')
    parts.push(
      <a
        key={start}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        download={isPdf ? 'Sahid_Al_Hassan_Resume.pdf' : undefined}
        className="text-[#79C0FF] underline hover:text-[#7EE787] transition-colors"
      >
        {url}
      </a>
    )

    lastIndex = end
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ entries }) => {
  return (
    <div className="space-y-3 font-mono text-sm leading-relaxed">
      {entries.map((entry) => {
        if (entry.type === 'input') {
          return (
            <div key={entry.id} className="flex items-start space-x-2">
              <span className="text-[#7EE787] font-bold shrink-0 select-none">
                sahid@portfolio:{entry.cwd || '~'}$
              </span>
              <span className="text-[#79C0FF] font-semibold">{entry.command}</span>
            </div>
          )
        }

        if (entry.type === 'error') {
          return (
            <div key={entry.id} className="text-[#FFA198] whitespace-pre-wrap">
              {typeof entry.content === 'string'
                ? renderContentWithLinks(entry.content)
                : entry.content}
            </div>
          )
        }

        return (
          <div key={entry.id} className="text-[#E6EDF3] whitespace-pre-wrap">
            {typeof entry.content === 'string'
              ? renderContentWithLinks(entry.content)
              : entry.content}
          </div>
        )
      })}
    </div>
  )
}
