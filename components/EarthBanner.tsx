// An original night-side Earth illustration: a dark planet with a bright rim and scattered city lights.
const LIGHTS = Array.from({ length: 90 }, (_, i) => {
  // Deterministic pseudo-random points so the picture is the same on every render.
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 24634.6345;
  const x = 120 + (a - Math.floor(a)) * 520;
  const y = 60 + (b - Math.floor(b)) * 300;
  return { x, y, r: 0.8 + ((i * 7) % 10) / 8, o: 0.4 + ((i * 13) % 10) / 16 };
}).filter((p) => Math.hypot(p.x - 520, p.y - 560) < 540 && Math.hypot(p.x - 520, p.y - 560) > 380);

export default function EarthBanner({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 360" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="eb-planet" cx="50%" cy="100%" r="80%">
          <stop offset="0" stopColor="#0b1a4a" />
          <stop offset="0.7" stopColor="#081235" />
          <stop offset="1" stopColor="#050a22" />
        </radialGradient>
        <linearGradient id="eb-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="0.5" stopColor="#7fb0ff" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <filter id="eb-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <circle cx="520" cy="560" r="470" fill="url(#eb-planet)" />
      <path d="M60 252 A470 470 0 0 1 980 252" transform="translate(-40 0)" fill="none" stroke="url(#eb-rim)" strokeWidth="5" filter="url(#eb-glow)" opacity="0.9" />
      <circle cx="520" cy="560" r="470" fill="none" stroke="#7fb0ff" strokeOpacity="0.35" strokeWidth="1.5" />
      <g fill="#ffd9a0">
        {LIGHTS.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} opacity={p.o} />
        ))}
      </g>
      <g stroke="#7fb0ff" strokeOpacity="0.35" fill="none">
        <ellipse cx="520" cy="190" rx="300" ry="60" transform="rotate(-12 520 190)" />
        <ellipse cx="520" cy="190" rx="360" ry="80" transform="rotate(-12 520 190)" strokeDasharray="3 7" />
      </g>
      <g transform="translate(300 128) rotate(-18)">
        <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#e9eeff" />
        <rect x="-26" y="-4" width="16" height="8" fill="#4c7dff" />
        <rect x="10" y="-4" width="16" height="8" fill="#4c7dff" />
      </g>
    </svg>
  );
}
