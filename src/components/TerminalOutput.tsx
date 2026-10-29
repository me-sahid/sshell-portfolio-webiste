import React from 'react'
import type { TerminalEntry } from '../data/types'

interface TerminalOutputProps {
  entries: TerminalEntry[]
}

function renderTokensAndLinks(text: string): (string | React.ReactNode)[] {
  // Regex to match URLs, PDF resumes, quoted commands like 'help', and CGPA patterns
  const tokenRegex = /(https?:\/\/[^\s]+|\/Sahid_Al_Hassan_Resume\.pdf|'([a-zA-Z0-9_\-\s]+)'|\(cgpa:\s*[\d.]+\))/g
  const parts: (string | React.ReactNode)[] = []
  let lastIndex = 0
  let match

  while ((match = tokenRegex.exec(text)) !== null) {
    const start = match.index
    const end = tokenRegex.lastIndex
    const token = match[0]

    if (start > lastIndex) {
      parts.push(text.substring(lastIndex, start))
    }

    if (token.startsWith('http') || token.endsWith('.pdf')) {
      const isPdf = token.endsWith('.pdf')
      parts.push(
        <a
          key={start}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          download={isPdf ? 'Sahid_Al_Hassan_Resume.pdf' : undefined}
          className="text-[var(--command-cyan)] underline hover:text-[var(--prompt-green)] transition-colors break-all"
        >
          {token}
        </a>
      )
    } else if (token.startsWith("'") && token.endsWith("'")) {
      const cmdName = match[2]
      parts.push(
        <code
          key={start}
          className="text-[var(--command-cyan)] bg-[var(--term-header)]/90 border border-[var(--term-border)] hover:border-[var(--prompt-green)] px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-mono font-semibold select-all transition-colors inline-block mx-0.5"
          title={`Command: ${cmdName}`}
        >
          '{cmdName}'
        </code>
      )
    } else if (token.toLowerCase().includes('cgpa:')) {
      parts.push(
        <span
          key={start}
          className="text-[var(--prompt-green)] font-semibold font-mono bg-[var(--term-header)]/60 px-1 rounded border border-[var(--term-border)]/50"
        >
          {token}
        </span>
      )
    }

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
    <div className="space-y-1 font-mono">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        const lower = trimmed.toLowerCase()

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />
        }

        // Tree root header: ┌── <title>
        if (trimmed.startsWith('┌──')) {
          const title = trimmed.replace('┌──', '').trim()
          return (
            <div key={idx} className="flex items-center space-x-2 pt-1 text-xs sm:text-sm">
              <span className="text-[var(--prompt-green)] font-bold select-none text-sm sm:text-base">┌──</span>
              <span className="text-[var(--text-primary)] font-bold uppercase tracking-wider text-sm sm:text-base">
                {title}
              </span>
            </div>
          )
        }

        // Tree vertical trunk: │   <subtitle>
        if (trimmed.startsWith('│')) {
          const rest = trimmed.replace(/^│\s*/, '')
          return (
            <div key={idx} className="flex items-baseline space-x-2 text-xs sm:text-sm pl-0.5">
              <span className="text-[var(--prompt-green)]/60 font-bold select-none shrink-0">│</span>
              <span className="text-[var(--text-secondary)]">{renderTokensAndLinks(rest)}</span>
            </div>
          )
        }

        // Tree section node with badge: e.g. ├── [01] background or └── [03] commands
        const sectionMatch = trimmed.match(/^(├──|└──)\s*(\[\d+\]|\[\+\])\s*(.*)$/)
        if (sectionMatch) {
          const [, branch, badge, title] = sectionMatch
          return (
            <div key={idx} className="flex items-center space-x-2 pt-2 pb-0.5 text-xs sm:text-sm pl-0.5">
              <span className="text-[var(--prompt-green)] font-bold select-none shrink-0">{branch}</span>
              <span className="text-[var(--command-cyan)] font-bold bg-[var(--term-header)] px-1.5 py-0.5 rounded border border-[var(--term-border)] text-[10px] sm:text-xs tracking-wider">
                {badge}
              </span>
              <span className="text-[var(--prompt-green)] font-bold uppercase tracking-wider text-xs sm:text-sm">
                {title}
              </span>
            </div>
          )
        }

        // Tree child item: e.g. ├── ... or └── ...
        const childBranchMatch = trimmed.match(/^(├──|└──)\s*(.*)$/)
        if (childBranchMatch) {
          const [, branch, itemText] = childBranchMatch
          if (itemText.includes(' :: ')) {
            const [key, ...valParts] = itemText.split(' :: ')
            const val = valParts.join(' :: ')
            return (
              <div key={idx} className="flex items-start space-x-1.5 text-xs sm:text-sm pl-3 sm:pl-5">
                <span className="text-[var(--prompt-green)]/70 font-bold select-none shrink-0">{branch}</span>
                <div className="flex-1 leading-relaxed break-words">
                  <span className="text-[var(--command-cyan)] font-semibold">{key.trim()}</span>
                  <span className="text-[var(--prompt-green)] font-bold mx-1.5 select-none">::</span>
                  <span className="text-[var(--text-primary)]">{renderTokensAndLinks(val.trim())}</span>
                </div>
              </div>
            )
          }

          return (
            <div key={idx} className="flex items-start space-x-1.5 text-xs sm:text-sm pl-3 sm:pl-5">
              <span className="text-[var(--prompt-green)]/70 font-bold select-none shrink-0">{branch}</span>
              <span className="text-[var(--text-primary)] leading-relaxed break-words flex-1">
                {renderTokensAndLinks(itemText)}
              </span>
            </div>
          )
        }

        // Legacy bullet point: - ... or • ...
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const text = trimmed.substring(2)
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2 text-xs sm:text-sm">
              <span className="text-[var(--prompt-green)] select-none shrink-0 font-bold">{'->'}</span>
              <span className="text-[var(--text-primary)] leading-relaxed break-words flex-1">
                {renderTokensAndLinks(text)}
              </span>
            </div>
          )
        }

        // Legacy section keyword header (e.g. "background", "projects", "commands")
        if (sectionKeywords.has(lower) || (lower.endsWith(':') && lower.length < 25 && !lower.includes(' '))) {
          return (
            <div key={idx} className="flex items-center space-x-1.5 pt-2 text-[var(--prompt-green)] font-bold text-xs sm:text-sm">
              <span className="text-[var(--command-cyan)] font-bold select-none">::</span>
              <span className="uppercase tracking-wider">{line}</span>
            </div>
          )
        }

        // Title line (e.g. "sahid al hassan")
        if (idx === 0 && lower === 'sahid al hassan') {
          return (
            <div key={idx} className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-wide uppercase">
              {line}
            </div>
          )
        }

        // Subtitle line immediately following title
        if (idx === 1 && lines[0]?.trim().toLowerCase() === 'sahid al hassan') {
          return (
            <div key={idx} className="text-xs sm:text-sm text-[var(--text-secondary)] pb-1">
              {line}
            </div>
          )
        }

        // Standard line
        return (
          <div key={idx} className="text-[var(--text-primary)] text-xs sm:text-sm leading-relaxed overflow-x-auto scrollbar-none whitespace-pre-wrap break-words">
            {renderTokensAndLinks(line)}
          </div>
        )
      })}
    </div>
  )
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ entries }) => {
  return (
    <div className="space-y-3 font-mono text-xs sm:text-sm leading-relaxed break-words">
      {entries.map((entry) => {
        if (entry.type === 'input') {
          return (
            <div key={entry.id} className="flex flex-wrap sm:flex-nowrap items-baseline space-x-1 sm:space-x-2">
              <span className="text-[var(--prompt-green)] font-bold shrink-0 select-none text-xs sm:text-sm">
                sahid@portfolio:{entry.cwd || '~'}$
              </span>
              <span className="text-[var(--command-cyan)] font-semibold break-all text-xs sm:text-sm">{entry.command}</span>
            </div>
          )
        }

        if (entry.type === 'error') {
          return (
            <div key={entry.id} className="text-[#FFA198] whitespace-pre-wrap break-words text-xs sm:text-sm">
              {typeof entry.content === 'string'
                ? renderTokensAndLinks(entry.content)
                : entry.content}
            </div>
          )
        }

        return (
          <div key={entry.id} className="whitespace-pre-wrap break-words overflow-x-auto scrollbar-none">
            {typeof entry.content === 'string'
              ? renderFormattedBlock(entry.content)
              : entry.content}
          </div>
        )
      })}
    </div>
  )
}
