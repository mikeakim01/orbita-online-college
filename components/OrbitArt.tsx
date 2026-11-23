export default function OrbitArt() {
  return (
    <svg className="orbit-art" viewBox="0 0 400 320" role="img" aria-label="Illustration of a satellite orbiting the Earth">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FF5238" stopOpacity=".35" />
          <stop offset="1" stopColor="#FF5238" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="160" r="150" fill="url(#glow)" />
      {[70, 105, 140].map((r, i) => (
        <ellipse key={r} cx="200" cy="160" rx={r + 30} ry={r * 0.45} fill="none" stroke="#5CD9FF" strokeOpacity={0.55 - i * 0.14} strokeDasharray={i ? '3 6' : undefined} transform={'rotate(' + (-18 + i * 14) + ' 200 160)'} />
      ))}
      <circle cx="200" cy="160" r="56" fill="#111A33" stroke="#3A4B7A" />
      <path d="M156 150c14-10 26 2 38-6s10-18 28-14 26 16 22 30-24 6-34 16-30 6-44-2-18-14-10-24z" fill="#24325A" />
      <g transform="translate(300 96) rotate(24)">
        <rect x="-9" y="-9" width="18" height="18" rx="2" fill="#EAF0FF" />
        <rect x="-38" y="-6" width="24" height="12" fill="#FF5238" />
        <rect x="14" y="-6" width="24" height="12" fill="#FF5238" />
        <rect x="-3" y="-17" width="6" height="8" fill="#9AA7C7" />
      </g>
      {[[52, 50], [346, 250], [90, 268], [352, 52], [36, 160], [372, 160]].map(([x, y]) => (
        <circle key={x + '-' + y} cx={x} cy={y} r="1.8" fill="#EAF0FF" opacity=".7" />
      ))}
    </svg>
  );
}
