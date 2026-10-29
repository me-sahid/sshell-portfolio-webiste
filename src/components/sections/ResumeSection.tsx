import React from 'react'
import { Terminal, FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react'

interface SectionProps {
  onBackToTerminal?: () => void
}

export const ResumeSection: React.FC<SectionProps> = ({ onBackToTerminal }) => {
  const resumeUrl = '/Sahid_Al_Hassan_Resume.pdf'

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = resumeUrl
    link.download = 'Sahid_Al_Hassan_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleView = () => {
    window.open(resumeUrl, '_blank')
  }

  return (
    <div className="space-y-6 text-[#E6EDF3]">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-[#7EE787]" />
          <h2 className="text-xl font-bold tracking-tight text-[#E6EDF3]">~/resume</h2>
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

      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[#21262D] text-[#7EE787] border border-[#30363D]">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#E6EDF3]">
                Sahid_Al_Hassan_Resume.pdf
              </h3>
              <p className="text-xs text-[#8B949E] mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7EE787]" />
                Verified authentic asset • PDF document
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleView}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#21262D] hover:bg-[#30363D] text-[#79C0FF] border border-[#30363D] text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View in Browser</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-[#30363D]/60 pt-4 text-xs text-[#8B949E] space-y-2">
          <p>
            <strong className="text-[#E6EDF3]">Terminal commands:</strong> You can also run{' '}
            <code className="text-[#7EE787] bg-[#21262D] px-1 py-0.5 rounded">resume --view</code> to
            preview or{' '}
            <code className="text-[#7EE787] bg-[#21262D] px-1 py-0.5 rounded">resume --download</code> to
            save directly.
          </p>
        </div>
      </div>
    </div>
  )
}

