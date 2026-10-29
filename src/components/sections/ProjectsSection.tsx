import React from 'react'
import { PROJECTS } from '../../data/portfolioData'
import { Terminal, ExternalLink, Calendar, Layers } from 'lucide-react'

interface SectionProps {
  onBackToTerminal?: () => void
}

export const ProjectsSection: React.FC<SectionProps> = ({ onBackToTerminal }) => {
  return (
    <div className="space-y-6 text-[#E6EDF3]">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-[#7EE787]" />
          <h2 className="text-xl font-bold tracking-tight text-[#E6EDF3]">~/projects</h2>
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

      <div className="space-y-6">
        {PROJECTS.map((project) => (
          <div
            key={project.id}
            className="bg-[#161B22] border border-[#30363D] rounded-lg p-5 hover:border-[#79C0FF]/50 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363D]/60 pb-3 mb-3">
              <div>
                <h3 className="text-lg font-bold text-[#7EE787] flex items-center gap-2">
                  <span>{project.name}</span>
                  {project.website && (
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-[#79C0FF] hover:underline gap-1 bg-[#79C0FF]/10 px-2 py-0.5 rounded border border-[#79C0FF]/30"
                      title={`Visit ${project.name}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{project.website}</span>
                    </a>
                  )}
                </h3>
              </div>
              <div className="flex items-center text-xs text-[#8B949E] gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{project.dates}</span>
              </div>
            </div>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-0.5 rounded bg-[#21262D] text-[#79C0FF] border border-[#30363D]"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Bullets */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase text-[#8B949E] tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#7EE787]" />
                Key Architectural Highlights
              </div>
              <ul className="text-xs text-[#E6EDF3] space-y-2">
                {project.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#7EE787] font-mono mt-0.5">❯</span>
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

