import React from 'react'
import { Terminal, FolderGit2, Wrench, GraduationCap, Trophy, FileText, Mail } from 'lucide-react'

export type ActiveView = 'terminal' | 'about' | 'projects' | 'skills' | 'education' | 'achievements' | 'resume' | 'contact'

interface NavigationProps {
  activeView: ActiveView
  onSelectView: (view: ActiveView) => void
}

interface NavItem {
  id: ActiveView
  label: string
  icon: React.ReactNode
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, onSelectView }) => {
  const items: NavItem[] = [
    { id: 'terminal', label: 'terminal', icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: 'about', label: '~/about', icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: 'projects', label: '~/projects', icon: <FolderGit2 className="w-3.5 h-3.5" /> },
    { id: 'skills', label: '~/skills', icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'education', label: '~/education', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'achievements', label: '~/achievements', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'resume', label: '~/resume', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'contact', label: '~/contact', icon: <Mail className="w-3.5 h-3.5" /> },
  ]

  return (
    <nav aria-label="Portfolio sections" className="border-b border-[#30363D] bg-[#161B22]/90 px-3 py-2 overflow-x-auto">
      <div className="flex items-center space-x-1.5 min-w-max text-xs font-mono">
        {items.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                isActive
                  ? 'bg-[#30363D] text-[#7EE787] font-semibold border border-[#7EE787]/30'
                  : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

