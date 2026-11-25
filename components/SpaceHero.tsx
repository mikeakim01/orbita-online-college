/** Earth seen from orbit, drawn as SVG so it is crisp at every size and needs no image download. */
const STARS = Array.from({ length: 90 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: r(1) * 1600, y: r(2) * 640, s: 0.6 + r(3) * 1.6, o: 0.3 + r(4) * 0.7 };
});

export default function SpaceHero({ className = '' }: { className?: string }) {
  return (
    <svg className={'space ' + className} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#040b17" />
          <stop offset="0.6" stopColor="#071426" />
          <stop offset="1" stopColor="#0d2547" />
        </linearGradient>
        <radialGradient id="sp-planet" cx="0.5" cy="0.12" r="0.9">
          <stop offset="0" stopColor="#2d6bd6" />
          <stop offset="0.35" stopColor="#154082" />
          <stop offset="0.8" stopColor="#0a1f40" />
          <stop offset="1" stopColor="#050f20" />
        </radialGradient>
        <radialGradient id="sp-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.82" stopColor="#3478f6" stopOpacity="0" />
          <stop offset="0.93" stopColor="#5b9bff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#3478f6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sp-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d6b36a" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffe2a3" stopOpacity="0.95" />
          <stop offset="1" stopColor="#d6b36a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#sp-sky)" />
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={s.o} />
      ))}
      <circle cx="800" cy="1560" r="1010" fill="url(#sp-glow)" />
      <circle cx="800" cy="1560" r="900" fill="url(#sp-planet)" />
      <path d="M0 720C260 650 560 640 800 660s560 20 800-40" stroke="#5b9bff" strokeOpacity="0.14" strokeWidth="2" fill="none" />
      <path d="M0 800C300 740 600 730 800 745s520 12 800-50" stroke="#5b9bff" strokeOpacity="0.1" strokeWidth="2" fill="none" />
      <path d="M120 662Q800 610 1480 662" stroke="url(#sp-rim)" strokeWidth="3" fill="none" />
      <g stroke="#9ec1ff" strokeOpacity="0.35" fill="none" strokeWidth="1.2" strokeDasharray="3 9">
        <ellipse cx="1120" cy="470" rx="560" ry="120" transform="rotate(-12 1120 470)" />
        <ellipse cx="1120" cy="470" rx="420" ry="80" transform="rotate(-12 1120 470)" />
      </g>
      <g transform="translate(1262 392) rotate(-22)">
        <rect x="-16" y="-12" width="32" height="24" rx="4" fill="#e8edf3" />
        <rect x="-76" y="-8" width="52" height="16" rx="2" fill="#3478f6" stroke="#e8edf3" strokeWidth="1.5" />
        <rect x="24" y="-8" width="52" height="16" rx="2" fill="#3478f6" stroke="#e8edf3" strokeWidth="1.5" />
        <path d="M-50 -8v16M-63 -8v16M-37 -8v16M37 -8v16M50 -8v16M63 -8v16" stroke="#071426" strokeOpacity="0.5" />
        <circle cx="0" cy="18" r="3.5" fill="#d6b36a" />
      </g>
    </svg>
  );
}
