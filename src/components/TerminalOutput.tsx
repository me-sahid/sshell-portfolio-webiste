import React from 'react'
import type { TerminalEntry } from '../data/types'

interface TerminalOutputProps {
  entries: TerminalEntry[]
}

function renderContentWithLinks(text: string) {
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
        className="text-[var(--command-cyan)] underline hover:text-[var(--prompt-green)] transition-colors"
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

function renderFormattedBlock(content: string) {
  const lines = content.split('\n')
  const sectionKeywords = new Set([
    'background',
    'projects',
    'featured projects',
    'commands',
    'contact',
    'education',
    'technical skills',
    'certificates / achievements',
  ])

  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        const lower = trimmed.toLowerCase()

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-2" />
        }

        // Section header (e.g. "background", "projects", "commands")
        if (sectionKeywords.has(lower) || (lower.endsWith(':') && lower.length < 25 && !lower.includes(' '))) {
          return (
            <div key={idx} className="text-[var(--prompt-green)] font-semibold pt-1">
              {line}
            </div>
          )
        }

        // Title line (e.g. "sahid al hassan")
        if (idx === 0 && lower === 'sahid al hassan') {
          return (
            <div key={idx} className="text-base font-bold text-[var(--text-primary)] tracking-wide">
              {line}
            </div>
          )
        }

        // Subtitle line immediately following title
        if (idx === 1 && lines[0]?.trim().toLowerCase() === 'sahid al hassan') {
          return (
            <div key={idx} className="text-sm text-[var(--text-secondary)] pb-1">
              {line}
            </div>
          )
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const bullet = trimmed.substring(0, 2)
          const text = trimmed.substring(2)
          return (
            <div key={idx} className="flex items-start space-x-1.5 pl-0.5">
              <span className="text-[var(--text-secondary)] select-none shrink-0">{bullet}</span>
              <span className="text-[var(--text-primary)]">{renderContentWithLinks(text)}</span>
            </div>
          )
        }

        // Standard line
        return (
          <div key={idx} className="text-[var(--text-primary)]">
            {renderContentWithLinks(line)}
          </div>
        )
      })}
    </div>
  )
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ entries }) => {
  return (
    <div className="space-y-3 font-mono text-sm leading-relaxed">
      {entries.map((entry) => {
        if (entry.type === 'input') {
          return (
            <div key={entry.id} className="flex items-start space-x-2">
              <span className="text-[var(--prompt-green)] font-bold shrink-0 select-none">
                sahid@portfolio:{entry.cwd || '~'}$
              </span>
              <span className="text-[var(--command-cyan)] font-semibold">{entry.command}</span>
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
          <div key={entry.id} className="whitespace-pre-wrap">
            {typeof entry.content === 'string'
              ? renderFormattedBlock(entry.content)
              : entry.content}
          </div>
        )
      })}
    </div>
  )
}
