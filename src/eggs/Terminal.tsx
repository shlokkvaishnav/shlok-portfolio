import { useEffect, useRef, useState } from 'react'
import { projects } from '@/content/projects'
import { site, socials } from '@/content/site'
import { unlock } from './registry'
import { triggerSingularity } from './fx'

/** Real lunar craters with morphometric parameters (Chandrayaan-adjacent flavor). */
const CRATERS = [
  { name: 'Tycho', d: 85, depth: 4.8, pos: '43.3°S 11.4°W', age: 'Copernican' },
  { name: 'Copernicus', d: 93, depth: 3.8, pos: '9.6°N 20.1°W', age: 'Copernican' },
  { name: 'Aristarchus', d: 40, depth: 2.7, pos: '23.7°N 47.4°W', age: 'Copernican' },
  { name: 'Kepler', d: 32, depth: 2.6, pos: '8.1°N 38.0°W', age: 'Copernican' },
  { name: 'Eratosthenes', d: 59, depth: 3.6, pos: '14.5°N 11.3°W', age: 'Eratosthenian' },
  { name: 'Theophilus', d: 99, depth: 4.2, pos: '11.4°S 26.4°E', age: 'Eratosthenian' },
  { name: 'Langrenus', d: 132, depth: 4.5, pos: '8.9°S 61.1°E', age: 'Eratosthenian' },
  { name: 'Petavius', d: 184, depth: 3.4, pos: '25.1°S 60.4°E', age: 'Imbrian' },
  { name: 'Plato', d: 101, depth: 1.0, pos: '51.6°N 9.4°W', age: 'Imbrian' },
  { name: 'Clavius', d: 225, depth: 3.5, pos: '58.4°S 14.4°W', age: 'Nectarian' },
  { name: 'Shackleton', d: 21, depth: 4.2, pos: '89.9°S 0.0°E', age: 'pre-Nectarian' },
]

const MORSE: Record<string, string> = {
  a: '·−', b: '−···', c: '−·−·', d: '−··', e: '·', f: '··−·', g: '−−·', h: '····',
  i: '··', j: '·−−−', k: '−·−', l: '·−··', m: '−−', n: '−·', o: '−−−', p: '·−−·',
  q: '−−·−', r: '·−·', s: '···', t: '−', u: '··−', v: '···−', w: '·−−', x: '−··−',
  y: '−·−−', z: '−−··',
}

const COMMANDS = ['help', 'about', 'projects', 'contact', 'crater', 'ndvi', 'morse', 'singularity', 'clear', 'exit'] as const

function run(input: string, close: () => void): string[] {
  const [cmd = '', ...args] = input.trim().split(/\s+/)
  switch (cmd.toLowerCase()) {
    case 'help':
      return [
        'available commands:',
        '  about        who is flying this thing',
        '  projects     mission log',
        '  contact      open a channel',
        '  crater [x]   ISRO lunar crater morphometry',
        '  ndvi         castor crop vigor, one season',
        '  morse [word] encode a transmission',
        '  singularity  do not run this command',
        '  clear · exit',
      ]
    case 'about':
      return [site.positioning, `${site.education.program}, ${site.education.institution}.`]
    case 'projects':
      return projects.map((p) => `  ${p.title.padEnd(28)} ${p.github}`)
    case 'contact':
      return [`  email     ${site.email}`, ...socials.map((s) => `  ${s.label.toLowerCase().padEnd(9)} ${s.href}`)]
    case 'crater': {
      const q = args.join(' ').toLowerCase()
      if (!q) {
        return [
          'usage: crater <name>',
          `known: ${CRATERS.map((c) => c.name).join(', ')}`,
        ]
      }
      const c = CRATERS.find((c) => c.name.toLowerCase() === q)
      if (!c) return [`no crater '${q}' in the sample. try: crater`]
      return [
        `${c.name.toUpperCase()}`,
        `  diameter   ${c.d} km`,
        `  depth      ${c.depth} km`,
        `  d/D ratio  ${(c.depth / c.d).toFixed(3)}`,
        `  position   ${c.pos}`,
        `  epoch      ${c.age}`,
      ]
    }
    case 'morse': {
      const word = (args[0] ?? '').toLowerCase()
      if (!word) return ['usage: morse <word>']
      const code = [...word].map((ch) => MORSE[ch] ?? '?').join(' ')
      if (word === 'shlok') {
        unlock('morse')
        return [`${code}`, 'transmission decoded. the footer beacon can rest now.']
      }
      return [code]
    }
    case 'ndvi':
      return ['__NDVI__']
    case 'singularity':
      unlock('singularity')
      triggerSingularity()
      return ['gravitational lensing engaged. watch the sky for the next eight seconds.']
    case 'clear':
      return ['__CLEAR__']
    case 'exit':
      close()
      return []
    case '':
      return []
    default:
      return [`unknown command: ${cmd} — try 'help'`]
  }
}

/** Deterministic little field for the NDVI heatmap. */
function ndviFrame(month: number): string[] {
  const CHARS = ' .:-=+*#%@'
  const rows: string[] = []
  const season = Math.max(0, Math.sin(((month - 1.5) / 12) * Math.PI * 2)) // sow→peak→harvest
  for (let y = 0; y < 10; y++) {
    let row = ''
    for (let x = 0; x < 24; x++) {
      const field = 0.45 + 0.55 * Math.abs(Math.sin(x * 0.9 + y * 1.7) * Math.cos(y * 0.55 - x * 0.21))
      const v = Math.min(0.999, field * season)
      row += CHARS[Math.floor(v * CHARS.length)] ?? ' '
    }
    rows.push(row)
  }
  rows.push(`  month ${String(month + 1).padStart(2, '0')} — simulated castor vigor`)
  return rows
}

interface Line {
  id: number
  text: string
  kind: 'in' | 'out'
}

export default function Terminal({ onClose }: { onClose: () => void }) {
  const [lines, setLines] = useState<Line[]>([
    { id: 0, text: 'SV-01 research console — type help', kind: 'out' },
  ])
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(1)
  const ndviTimer = useRef<number[]>([])

  useEffect(() => {
    inputRef.current?.focus()
    const timers = ndviTimer.current
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const push = (texts: string[], kind: Line['kind']) => {
    setLines((l) => [...l, ...texts.map((text) => ({ id: idRef.current++, text, kind }))])
  }

  const playNdvi = () => {
    ndviTimer.current.forEach(clearTimeout)
    ndviTimer.current = []
    for (let m = 0; m < 12; m++) {
      ndviTimer.current.push(
        window.setTimeout(() => {
          setLines((l) => {
            // Replace the previous frame in place so the field animates.
            const withoutFrame = l.filter((line) => !line.text.startsWith('§'))
            return [
              ...withoutFrame,
              ...ndviFrame(m).map((text) => ({ id: idRef.current++, text: `§${text}`, kind: 'out' as const })),
            ]
          })
        }, m * 250),
      )
    }
  }

  const submit = () => {
    push([`sv-01 % ${value}`], 'in')
    const out = run(value, onClose)
    if (out[0] === '__CLEAR__') {
      setLines([])
    } else if (out[0] === '__NDVI__') {
      playNdvi()
    } else if (out.length > 0) {
      push(out, 'out')
    }
    setValue('')
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
    if (e.key === 'Escape') onClose()
    if (e.key === 'Tab') {
      e.preventDefault()
      const hit = COMMANDS.find((c) => c.startsWith(value.toLowerCase()))
      if (hit && value.length > 0) setValue(hit)
    }
    if (e.key === '`') e.preventDefault() // parent toggle owns this key
  }

  return (
    <div
      role="dialog"
      aria-label="Research console"
      className="fixed inset-x-0 bottom-0 z-50 h-[52dvh] border-t border-hairline bg-void/95 backdrop-blur-sm md:h-[40dvh]"
    >
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col px-4 py-3 md:px-8">
        <div className="flex items-baseline justify-between">
          <p className="telemetry text-[9px] text-ink-faint">SV-01 · research console</p>
          <button
            type="button"
            onClick={onClose}
            className="telemetry text-[9px] text-ink-mute transition-colors hover:text-ink"
          >
            Esc
          </button>
        </div>
        <div
          ref={scrollRef}
          className="mt-2 flex-1 overflow-y-auto font-mono text-xs leading-relaxed text-ink-mute"
          data-lenis-prevent
        >
          {lines.map((line) => (
            <p key={line.id} className={line.kind === 'in' ? 'text-ink' : ''}>
              {line.text.startsWith('§') ? (
                <span className="whitespace-pre text-gold">{line.text.slice(1)}</span>
              ) : (
                line.text
              )}
            </p>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 border-t border-hairline pt-2">
          <span className="font-mono text-xs text-gold">sv-01 %</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent font-mono text-xs text-ink outline-none"
            aria-label="Console input"
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
