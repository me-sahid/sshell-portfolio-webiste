import React, { useState, useEffect } from 'react'

interface BootSequenceProps {
  onComplete: () => void
}

const BOOT_LINES = [
  '[ OK ] Initializing user environment...',
  "[ OK ] Loading Sahid Al Hassan's profile...",
  '[ OK ] Indexing projects and technical skills...',
  '[ OK ] Starting interactive portfolio shell...',
  '',
  'Welcome to sahid.dev',
]

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [visibleCount, setVisibleCount] = useState<number>(0)

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      onComplete()
      return
    }

    // Sequence timer: ~450ms per line -> ~2.7s total
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < BOOT_LINES.length) {
          return prev + 1
        } else {
          clearInterval(timer)
          setTimeout(onComplete, 500)
          return prev
        }
      })
    }, 450)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        clearInterval(timer)
        onComplete()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearInterval(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onComplete])

  return (
    <div className="font-mono text-sm leading-relaxed p-6 space-y-1">
      <div className="flex justify-end mb-4">
        <button
          onClick={onComplete}
          className="text-xs px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] transition-colors"
        >
          Skip Boot [ESC]
        </button>
      </div>

      {BOOT_LINES.slice(0, visibleCount).map((line, index) => {
        if (!line) return <div key={index} className="h-4" />
        const isOk = line.startsWith('[ OK ]')
        const isWelcome = line.startsWith('Welcome')

        return (
          <div key={index} className="flex items-start">
            {isOk ? (
              <>
                <span className="text-[#7EE787] font-bold mr-2">[ OK ]</span>
                <span className="text-[#E6EDF3]">{line.replace('[ OK ]', '').trim()}</span>
              </>
            ) : isWelcome ? (
              <span className="text-[#79C0FF] font-bold text-base mt-2">{line}</span>
            ) : (
              <span className="text-[#E6EDF3]">{line}</span>
            )}
          </div>
        )
      })}

      {visibleCount < BOOT_LINES.length && (
        <span className="inline-block w-2.5 h-4 bg-[#7EE787] cursor-blink align-middle ml-1" />
      )}
    </div>
  )
}

