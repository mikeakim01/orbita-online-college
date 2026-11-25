import type { ReactNode } from 'react';

/**
 * Original illustrations drawn for Orbita (no stock photos, no external files).
 * Every scene is a 400x240 SVG so it scales cleanly and works in light and dark mode.
 */
export type SceneKind = 'it' | 'code' | 'cyber' | 'satellite' | 'crypto' | 'network' | 'cloud' | 'learn';

const COLORS: Record<SceneKind, [string, string]> = {
  it: ['#16365c', '#3478f6'],
  code: ['#0d1f38', '#2b63d6'],
  cyber: ['#071426', '#2b4f8f'],
  satellite: ['#071426', '#16507a'],
  crypto: ['#0d1f38', '#8a6a2a'],
  network: ['#0d1f38', '#1d6f9a'],
  cloud: ['#16365c', '#3478f6'],
  learn: ['#0d1f38', '#3478f6'],
};

const W = '#ffffff';
const line = { stroke: W, strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

function Motif({ kind }: { kind: SceneKind }): ReactNode {
  switch (kind) {
    case 'crypto':
      return (
        <g>
          <path d="M70 150h60M170 150h60M270 150h60" {...line} strokeDasharray="2 8" opacity=".7" />
          {[70, 170, 270].map((x, i) => (
            <g key={x} transform={`translate(${x - 34} ${118})`}>
              <rect width="68" height="64" rx="14" fill={W} opacity={i === 1 ? 1 : 0.85} />
              <path d="M16 22h36M16 34h26M16 46h32" stroke="#16365c" strokeWidth="4" strokeLinecap="round" opacity=".7" />
            </g>
          ))}
          <circle cx="200" cy="70" r="34" fill="#fbbf24" stroke={W} strokeWidth="4" />
          <circle cx="200" cy="70" r="24" fill="none" stroke="#b45309" strokeWidth="3" opacity=".6" />
          <path d="M192 56h12a8 8 0 010 16h-12m0 0h14a8 8 0 010 16h-14zM192 56v32M198 50v6M198 88v6M206 50v6M206 88v6" stroke="#92400e" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'network':
      return (
        <g>
          <path d="M200 120L90 60M200 120L320 60M200 120L90 190M200 120L320 190M200 120L200 40" {...line} opacity=".75" />
          {[[90, 60], [320, 60], [90, 190], [320, 190], [200, 40]].map(([x, y]) => (
            <g key={x + '-' + y}>
              <circle cx={x} cy={y} r="22" fill={W} opacity=".95" />
              <rect x={x - 11} y={y - 8} width="22" height="14" rx="3" fill="none" stroke="#0e7490" strokeWidth="3" />
              <path d={`M${x - 6} ${y + 12}h12`} stroke="#0e7490" strokeWidth="3" strokeLinecap="round" />
            </g>
          ))}
          <circle cx="200" cy="120" r="38" fill="#0d1f38" stroke={W} strokeWidth="4" />
          <path d="M184 120h32M200 104v32M190 110l20 20M210 110l-20 20" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'cloud':
      return (
        <g>
          <path d="M120 140a40 40 0 0140-40 52 52 0 01100 8 34 34 0 01-6 66H150a30 30 0 01-30-34z" fill={W} />
          <path d="M120 140a40 40 0 0140-40" stroke="#bae6fd" strokeWidth="4" fill="none" />
          <g stroke={W} strokeWidth="3" strokeLinecap="round" opacity=".85">
            <path d="M140 200v-18M200 205v-24M260 200v-18" />
            <rect x="120" y="198" width="40" height="22" rx="5" fill="#16365c" />
            <rect x="180" y="203" width="40" height="22" rx="5" fill="#16365c" />
            <rect x="240" y="198" width="40" height="22" rx="5" fill="#16365c" />
          </g>
          <path d="M168 138l16-16 16 16M184 122v34" stroke="#16365c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      );
    case 'cyber':
      return (
        <g>
          <path d="M60 60h60v30h50M340 70h-70v40h-40M70 200h80v-30h40M330 190h-60v-34" {...line} opacity=".45" />
          <path d="M200 36l82 28v56c0 46-34 76-82 90-48-14-82-44-82-90V64z" fill={W} />
          <path d="M200 36l82 28v56c0 46-34 76-82 90z" fill="#e9d5ff" opacity=".7" />
          <circle cx="200" cy="112" r="16" fill="#16365c" />
          <path d="M194 122l-6 28h24l-6-28z" fill="#16365c" />
        </g>
      );
    case 'satellite':
      return (
        <g>
          <circle cx="200" cy="330" r="200" fill="#0e7490" opacity=".55" />
          <circle cx="200" cy="330" r="200" fill="none" stroke="#67e8f9" strokeWidth="2" opacity=".7" />
          <ellipse cx="200" cy="140" rx="150" ry="46" fill="none" stroke={W} strokeWidth="2" strokeDasharray="4 8" opacity=".6" transform="rotate(-14 200 140)" />
          <g transform="rotate(-24 200 100)">
            <rect x="178" y="82" width="44" height="36" rx="6" fill={W} />
            <rect x="106" y="88" width="64" height="24" rx="3" fill="#38bdf8" stroke={W} strokeWidth="3" />
            <rect x="230" y="88" width="64" height="24" rx="3" fill="#38bdf8" stroke={W} strokeWidth="3" />
            <path d="M138 88v24M122 88v24M154 88v24M246 88v24M262 88v24M278 88v24" stroke="#0d1f38" strokeWidth="2" opacity=".5" />
            <path d="M200 118v14" stroke={W} strokeWidth="3" />
            <circle cx="200" cy="136" r="5" fill="#fbbf24" />
          </g>
          <path d="M150 172a70 70 0 00100 0M130 190a96 96 0 00140 0" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".85" />
          {[[60, 50], [330, 40], [350, 120], [40, 130], [290, 20]].map(([x, y]) => (
            <circle key={x + '' + y} cx={x} cy={y} r="2" fill={W} />
          ))}
        </g>
      );
    case 'code':
      return (
        <g>
          <rect x="70" y="40" width="260" height="170" rx="16" fill={W} />
          <path d="M70 70h260" stroke="#bfdbfe" strokeWidth="3" />
          {['#fb7185', '#fbbf24', '#34d399'].map((c, i) => <circle key={c} cx={92 + i * 18} cy="55" r="5" fill={c} />)}
          <path d="M100 98h60M100 120h110M124 142h80M100 164h50M170 164h70" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" opacity=".8" />
          <path d="M270 100l-22 20 22 20M300 100l22 20-22 20" stroke="#0891b2" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      );
    case 'learn':
      return (
        <g>
          <rect x="90" y="50" width="220" height="140" rx="14" fill={W} />
          <rect x="102" y="62" width="196" height="116" rx="8" fill="#e0e7ff" />
          <path d="M120 150l30-30 24 20 40-44 40 34" stroke="#16365c" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M60 196h280l-20 14H80z" fill={W} opacity=".9" />
          <g transform="translate(262 22)">
            <path d="M0 22l40-18 40 18-40 18z" fill="#fbbf24" />
            <path d="M18 34v16c8 8 36 8 44 0V34" fill="#f59e0b" />
            <path d="M80 22v22" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>
      );
    default:
      return (
        <g>
          <rect x="100" y="60" width="200" height="124" rx="12" fill={W} />
          <rect x="112" y="72" width="176" height="92" rx="6" fill="#dbeafe" />
          <path d="M130 100h60M130 120h100M130 140h70" stroke="#3c6bff" strokeWidth="6" strokeLinecap="round" opacity=".8" />
          <path d="M70 196h260l-18 14H88z" fill={W} opacity=".9" />
          <circle cx="262" cy="108" r="14" fill="#16365c" opacity=".85" />
        </g>
      );
  }
}

export default function Scene({ kind, className = '', label }: { kind: SceneKind; className?: string; label?: string }) {
  const [a, b] = COLORS[kind] ?? COLORS.it;
  const id = 'sc-' + kind;
  return (
    <svg className={'scene ' + className} viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <pattern id={id + '-d'} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="#fff" opacity=".22" />
        </pattern>
      </defs>
      <rect width="400" height="240" fill={`url(#${id})`} />
      <rect width="400" height="240" fill={`url(#${id}-d)`} />
      <circle cx="360" cy="-10" r="90" fill="#fff" opacity=".1" />
      <circle cx="30" cy="250" r="80" fill="#fff" opacity=".08" />
      <Motif kind={kind} />
    </svg>
  );
}

/** Pick an illustration for a course or faculty from its name and faculty slug. */
export function sceneFor(name: string, faculty?: string): SceneKind {
  const n = name.toLowerCase();
  if (/blockchain|crypto|smart contract|digital-asset/.test(n)) return 'crypto';
  if (/cloud|devops|container/.test(n)) return 'cloud';
  if (/network|routing|switching/.test(n)) return 'network';
  if (/web|python|code|software/.test(n)) return 'code';
  if (/satellite|radio|antenna|ground|earth|orbit|space/.test(n)) return 'satellite';
  if (/cyber|security|hack|incident|forensic|defen/.test(n)) return 'cyber';
  if (faculty === 'cyber') return 'cyber';
  if (faculty === 'satellite') return 'satellite';
  return 'it';
}
