export function DealsMarketIllustration() {
  return (
    <svg
      viewBox="0 0 560 360"
      role="img"
      aria-label="Stylized futures deals board with trend lines and payout cards"
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="board" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
        </linearGradient>
        <linearGradient id="lineA" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
        </linearGradient>
        <linearGradient id="lineB" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.55)" />
        </linearGradient>
      </defs>

      <rect x="30" y="30" width="500" height="300" rx="24" fill="url(#board)" />
      <rect x="30" y="30" width="500" height="300" rx="24" fill="none" stroke="rgba(255,255,255,0.25)" />

      <g stroke="rgba(255,255,255,0.12)">
        <line x1="70" y1="90" x2="490" y2="90" />
        <line x1="70" y1="145" x2="490" y2="145" />
        <line x1="70" y1="200" x2="490" y2="200" />
        <line x1="70" y1="255" x2="490" y2="255" />
        <line x1="120" y1="70" x2="120" y2="290" />
        <line x1="200" y1="70" x2="200" y2="290" />
        <line x1="280" y1="70" x2="280" y2="290" />
        <line x1="360" y1="70" x2="360" y2="290" />
        <line x1="440" y1="70" x2="440" y2="290" />
      </g>

      <path
        d="M70 245 C120 238, 140 196, 185 190 C232 184, 252 216, 300 202 C348 188, 366 132, 418 120 C448 114, 470 117, 490 100"
        fill="none"
        stroke="url(#lineA)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M70 270 C118 263, 150 228, 192 224 C234 220, 254 246, 302 236 C348 226, 370 186, 418 176 C446 170, 468 174, 490 162"
        fill="none"
        stroke="url(#lineB)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <g>
        <rect x="90" y="68" width="108" height="52" rx="12" fill="rgba(255,255,255,0.12)" />
        <text x="106" y="90" fill="rgba(255,255,255,0.85)" fontSize="13" fontWeight="700">
          DEAL WINDOW
        </text>
        <text x="106" y="107" fill="rgba(255,255,255,0.7)" fontSize="12">
          -50% eval
        </text>
      </g>

      <g>
        <rect x="338" y="224" width="132" height="66" rx="14" fill="rgba(255,255,255,0.15)" />
        <text x="354" y="248" fill="rgba(255,255,255,0.86)" fontSize="13" fontWeight="700">
          PAYOUT MODE
        </text>
        <text x="354" y="267" fill="rgba(255,255,255,0.72)" fontSize="12">
          Policy + fees
        </text>
      </g>
    </svg>
  )
}
