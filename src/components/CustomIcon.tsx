import React from 'react'

export const CustomIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    version="1.0"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1280 1108"
    preserveAspectRatio="xMidYMid meet"
    className={className}
    fill="currentColor"
  >
    <g
      transform="translate(0, 1108) scale(0.1, -0.1)"
      fill="currentColor"
      stroke="none"
    >
      <path d="M1580 11060 c-189 -34 -353 -99 -512 -204 -332 -219 -557 -549 -635 -933 -17 -84 -18 -282 -18 -3968 0 -4119 -2 -3924 45 -4095 63 -232 192 -449 374 -630 204 -203 437 -330 718 -392 l103 -23 4665 0 4665 0 103 23 c281 62 514 189 718 392 182 181 311 398 374 630 47 171 45 -24 45 4095 0 3686 -1 3884 -18 3968 -91 445 -382 822 -792 1022 -118 58 -225 92 -363 116 -112 19 -197 19 -4740 18 -4469 -1 -4631 -1 -4732 -19z" />
    </g>
  </svg>
)
