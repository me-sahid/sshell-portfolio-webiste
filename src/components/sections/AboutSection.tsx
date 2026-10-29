import React from 'react'
import { IDENTITY } from '../../data/portfolioData'
import { Terminal } from 'lucide-react'

interface SectionProps {
  onBackToTerminal?: () => void
}

export const AboutSection: React.FC<SectionProps> = ({ onBackToTerminal }) => {
  return (
    <div className="space-y-6 text-[#E6EDF3]">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-[#7EE787]" />
          <h2 className="text-xl font-bold tracking-tight text-[#E6EDF3]">~/about</h2>
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

      <div className="bg-[#1C2128] border border-[#30363D] rounded-lg p-5">
        <h3 className="text-lg font-semibold text-[#7EE787]">{IDENTITY.name}</h3>
        <p className="text-sm text-[#79C0FF] mt-0.5">Focus: {IDENTITY.focus}</p>
        <p className="text-sm text-[#E6EDF3] mt-3 leading-relaxed">
          {IDENTITY.shortIdentity}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[#79C0FF] mb-2 uppercase tracking-wider">
            Academic Status
          </h4>
          <p className="text-xs text-[#E6EDF3]">
            B.Tech in Computer Science and Engineering
          </p>
          <p className="text-xs text-[#8B949E] mt-1">
            Chaitanya Deemed to be University, Hyderabad
          </p>
          <div className="mt-3 inline-flex items-center px-2 py-0.5 rounded text-xs bg-[#238636]/20 text-[#7EE787] border border-[#238636]/40">
            Current SGPA: 9.38
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[#79C0FF] mb-2 uppercase tracking-wider">
            Core Interests
          </h4>
          <ul className="text-xs text-[#E6EDF3] space-y-1.5 list-disc list-inside">
            <li>Low-latency distributed systems & key-value stores</li>
            <li>Zero-knowledge cryptography & passkey security</li>
            <li>Linux systems programming & high-throughput backends</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
