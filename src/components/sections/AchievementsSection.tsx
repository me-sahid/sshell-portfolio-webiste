import React from 'react'
import { ACHIEVEMENTS } from '../../data/portfolioData'
import { Terminal, Trophy, Award, Star } from 'lucide-react'

interface SectionProps {
  onBackToTerminal?: () => void
}

export const AchievementsSection: React.FC<SectionProps> = ({ onBackToTerminal }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'ieee-ssit':
        return <Trophy className="w-5 h-5 text-[#F2CC60]" />
      case 'hack2skill':
        return <Star className="w-5 h-5 text-[#79C0FF]" />
      case 'academic-excellence':
      default:
        return <Award className="w-5 h-5 text-[#7EE787]" />
    }
  }

  return (
    <div className="space-y-6 text-[#E6EDF3]">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-[#7EE787]" />
          <h2 className="text-xl font-bold tracking-tight text-[#E6EDF3]">
            ~/achievements
          </h2>
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

      <div className="bg-[#1C2128] border border-[#30363D] rounded-lg p-3">
        <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
          Section: CERTIFICATES / ACHIEVEMENTS
        </span>
      </div>

      <div className="space-y-4">
        {ACHIEVEMENTS.map((item, idx) => (
          <div
            key={item.id}
            className="bg-[#161B22] border border-[#30363D] rounded-lg p-5 flex items-start gap-4"
          >
            <div className="p-2.5 rounded bg-[#21262D] shrink-0 mt-0.5">
              {getIcon(item.id)}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#E6EDF3] flex items-center gap-2">
                <span>{item.title}</span>
                <span className="text-xs px-2 py-0.2 rounded bg-[#30363D] text-[#8B949E]">
                  #{idx + 1}
                </span>
              </h3>
              <p className="text-sm text-[#8B949E] leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

