import React, { useState } from 'react'
import { IDENTITY } from '../../data/portfolioData'
import { Terminal, Mail, Phone, ExternalLink, Copy, Check, Globe } from 'lucide-react'

interface SectionProps {
  onBackToTerminal?: () => void
}

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)

const LinkedinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

export const ContactSection: React.FC<SectionProps> = ({ onBackToTerminal }) => {
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(IDENTITY.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 text-[#E6EDF3]">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-[#7EE787]" />
          <h2 className="text-xl font-bold tracking-tight text-[#E6EDF3]">~/contact</h2>
        </div>
        {onBackToTerminal && (
          <button
            onClick={onBackToTerminal}
            className="text-xs px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#79C0FF] transition-colors"
          >
            [ESC] Return to Terminal
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#8B949E] uppercase tracking-wider mb-2">
              <Mail className="w-4 h-4 text-[#7EE787]" />
              Email
            </div>
            <a
              href={`mailto:${IDENTITY.email}`}
              className="text-sm font-mono text-[#79C0FF] hover:underline break-all"
            >
              {IDENTITY.email}
            </a>
          </div>
          <div className="mt-3 pt-3 border-t border-[#30363D]/60 flex items-center justify-between">
            <span className="text-xs text-[#8B949E]">Direct contact</span>
            <button
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#7EE787]" />
                  <span className="text-[#7EE787]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8B949E]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Phone */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#8B949E] uppercase tracking-wider mb-2">
              <Phone className="w-4 h-4 text-[#79C0FF]" />
              Phone
            </div>
            <a
              href={`tel:${IDENTITY.phone.replace(/\s+/g, '')}`}
              className="text-sm font-mono text-[#E6EDF3] hover:text-[#7EE787] transition-colors"
            >
              {IDENTITY.phone}
            </a>
          </div>
          <div className="mt-3 pt-3 border-t border-[#30363D]/60 flex items-center justify-between">
            <span className="text-xs text-[#8B949E]">Voice & WhatsApp</span>
            <a
              href={`tel:${IDENTITY.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#79C0FF] transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Call</span>
            </a>
          </div>
        </div>

        {/* GitHub */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#8B949E] uppercase tracking-wider mb-2">
              <GithubIcon className="w-4 h-4 text-[#E6EDF3]" />
              GitHub
            </div>
            <a
              href={IDENTITY.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-[#79C0FF] hover:underline"
            >
              {IDENTITY.github}
            </a>
          </div>
          <div className="mt-3 pt-3 border-t border-[#30363D]/60 flex items-center justify-between">
            <span className="text-xs text-[#8B949E]">me-sahid</span>
            <a
              href={IDENTITY.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#79C0FF] transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open</span>
            </a>
          </div>
        </div>

        {/* LinkedIn */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#8B949E] uppercase tracking-wider mb-2">
              <LinkedinIcon className="w-4 h-4 text-[#79C0FF]" />
              LinkedIn
            </div>
            <a
              href={IDENTITY.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-[#79C0FF] hover:underline"
            >
              {IDENTITY.linkedin}
            </a>
          </div>
          <div className="mt-3 pt-3 border-t border-[#30363D]/60 flex items-center justify-between">
            <span className="text-xs text-[#8B949E]">sahid-al-hassan</span>
            <a
              href={IDENTITY.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#79C0FF] transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open</span>
            </a>
          </div>
        </div>
      </div>

      {/* Website */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[#21262D] text-[#7EE787]">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-[#8B949E] uppercase tracking-wider">Product / Website</div>
            <a
              href={IDENTITY.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-[#7EE787] hover:underline"
            >
              {IDENTITY.website}
            </a>
          </div>
        </div>
        <a
          href={IDENTITY.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#79C0FF] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Visit Zancrypt</span>
        </a>
      </div>
    </div>
  )
}
