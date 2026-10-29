import React from 'react'
import { SKILLS } from '../../data/portfolioData'
import { Terminal, Code2, Database, Globe, Wrench, Cpu } from 'lucide-react'

interface SectionProps {
  onBackToTerminal?: () => void
}

export const SkillsSection: React.FC<SectionProps> = ({ onBackToTerminal }) => {
  const categories = [
    {
      title: 'Programming Languages',
      icon: <Code2 className="w-4 h-4 text-[#7EE787]" />,
      items: SKILLS.programmingLanguages,
    },
    {
      title: 'Databases & Caching',
      icon: <Database className="w-4 h-4 text-[#79C0FF]" />,
      items: SKILLS.databasesAndCaching,
    },
    {
      title: 'Frameworks & Web',
      icon: <Globe className="w-4 h-4 text-[#F2CC60]" />,
      items: SKILLS.frameworksAndWeb,
    },
    {
      title: 'Tools/Technologies',
      icon: <Wrench className="w-4 h-4 text-[#FFA198]" />,
      items: SKILLS.toolsAndTechnologies,
    },
    {
      title: 'Core Concepts',
      icon: <Cpu className="w-4 h-4 text-[#BC8CFF]" />,
      items: SKILLS.coreConcepts,
    },
  ]

  return (
    <div className="space-y-6 text-[#E6EDF3]">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-[#7EE787]" />
          <h2 className="text-xl font-bold tracking-tight text-[#E6EDF3]">~/skills</h2>
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
        {categories.map((cat) => (
          <div
            key={cat.title}
            className="bg-[#161B22] border border-[#30363D] rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              {cat.icon}
              <h3 className="text-sm font-semibold text-[#E6EDF3] tracking-wide">
                {cat.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((item) => (
                <span
                  key={item}
                  className="text-xs px-2.5 py-1 rounded bg-[#21262D] text-[#E6EDF3] border border-[#30363D] hover:border-[#7EE787]/40 transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
