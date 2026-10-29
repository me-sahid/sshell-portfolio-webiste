import React from 'react'
import { EDUCATION } from '../../data/portfolioData'
import { Terminal, GraduationCap, Calendar, MapPin, Award } from 'lucide-react'

interface SectionProps {
  onBackToTerminal?: () => void
}

export const EducationSection: React.FC<SectionProps> = ({ onBackToTerminal }) => {
  return (
    <div className="space-y-6 text-[#E6EDF3]">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-[#7EE787]" />
          <h2 className="text-xl font-bold tracking-tight text-[#E6EDF3]">~/education</h2>
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

      <div className="space-y-4">
        {EDUCATION.map((edu, idx) => (
          <div
            key={idx}
            className="bg-[#161B22] border border-[#30363D] rounded-lg p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363D]/60 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-[#21262D] text-[#7EE787]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#E6EDF3]">
                    {edu.institution}
                  </h3>
                  <div className="flex items-center text-xs text-[#8B949E] gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {edu.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {edu.dates}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1 rounded-full bg-[#238636]/15 border border-[#238636]/40 text-[#7EE787] text-xs font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>CGPA: {edu.cgpa}</span>
              </div>
            </div>

            <p className="text-sm text-[#79C0FF] font-medium">{edu.degree}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
