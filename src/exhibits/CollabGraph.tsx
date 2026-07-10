import { useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const W = 100
const H = 60

interface Node {
  id: number
  x: number
  y: number
  label: string
  senior: boolean
}

const NODES: readonly Node[] = [
  { id: 0, x: 18, y: 16, label: 'AK', senior: true },
  { id: 1, x: 44, y: 10, label: 'RS', senior: false },
  { id: 2, x: 72, y: 15, label: 'MJ', senior: false },
  { id: 3, x: 12, y: 38, label: 'PT', senior: false },
  { id: 4, x: 38, y: 32, label: 'DV', senior: true },
  { id: 5, x: 64, y: 36, label: 'SN', senior: false },
  { id: 6, x: 88, y: 32, label: 'KL', senior: false },
  { id: 7, x: 30, y: 52, label: 'VR', senior: false }, // slides into a silo
  { id: 8, x: 62, y: 53, label: 'TS', senior: false },
]

type Edge = readonly [number, number, number] // a, b, weight 1-4

/** Eight weekly edge states. VR (7) gradually loses review connections. */
const WEEKS: readonly (readonly Edge[])[] = [
  [[0, 1, 3], [1, 2, 2], [0, 4, 4], [4, 5, 3], [5, 6, 2], [3, 7, 3], [4, 7, 2], [7, 8, 2], [4, 8, 1], [2, 5, 1]],
  [[0, 1, 2], [1, 2, 3], [0, 4, 3], [4, 5, 4], [5, 6, 1], [3, 7, 2], [4, 7, 2], [7, 8, 1], [3, 4, 2], [2, 6, 2]],
  [[0, 1, 3], [1, 4, 2], [0, 4, 2], [4, 5, 3], [5, 6, 3], [3, 7, 2], [4, 7, 1], [0, 3, 1], [5, 8, 2], [2, 5, 2]],
  [[0, 1, 2], [1, 2, 2], [0, 4, 4], [4, 5, 2], [5, 6, 2], [3, 7, 1], [4, 8, 2], [3, 4, 1], [2, 6, 1], [1, 5, 2]],
  [[0, 1, 3], [1, 2, 1], [0, 4, 3], [4, 5, 3], [5, 6, 2], [3, 7, 1], [5, 8, 3], [0, 3, 2], [2, 5, 3], [1, 4, 1]],
  [[0, 1, 2], [1, 2, 2], [0, 4, 2], [4, 5, 4], [5, 6, 3], [3, 7, 1], [4, 8, 2], [3, 4, 2], [2, 6, 2], [1, 5, 1]],
  [[0, 1, 3], [1, 2, 3], [0, 4, 3], [4, 5, 2], [5, 6, 2], [7, 8, 1], [5, 8, 2], [0, 3, 3], [2, 5, 1], [3, 4, 2]],
  [[0, 1, 2], [1, 2, 2], [0, 4, 4], [4, 5, 3], [5, 6, 3], [3, 7, 1], [4, 8, 3], [0, 3, 2], [2, 6, 2], [1, 5, 2]],
]

const edgeKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`)

/** Union of all edges that ever appear, so lines persist and only re-weight. */
const ALL_EDGES: readonly { key: string; a: number; b: number }[] = (() => {
  const seen = new Map<string, { key: string; a: number; b: number }>()
  for (const week of WEEKS) {
    for (const [a, b] of week) {
      const key = edgeKey(a, b)
      if (!seen.has(key)) seen.set(key, { key, a: Math.min(a, b), b: Math.max(a, b) })
    }
  }
  return [...seen.values()]
})()

/**
 * Collaboration graph across eight weeks of review activity. Edges reweight
 * as the team shifts; when a contributor drops to one connection the silo
 * ring appears — the moment the product exists for.
 */
export default function CollabGraph() {
  const reduced = useReducedMotion()
  const [week, setWeek] = useState(0)
  // Ring shows only when the delayed reveal was scheduled for the current week.
  const [ringWeek, setRingWeek] = useState<number | null>(null)
  const showRing = ringWeek === week

  const weights = useMemo(() => {
    const map = new Map<string, number>()
    for (const [a, b, w] of WEEKS[week] ?? []) map.set(edgeKey(a, b), w)
    return map
  }, [week])

  const degree = useMemo(() => {
    const d = new Array<number>(NODES.length).fill(0)
    for (const [a, b] of WEEKS[week] ?? []) {
      d[a] = (d[a] ?? 0) + 1
      d[b] = (d[b] ?? 0) + 1
    }
    return d
  }, [week])

  const isolatedId = degree.findIndex((d) => d <= 1)
  const reviews = (WEEKS[week] ?? []).reduce((s, [, , w]) => s + w, 0)

  useEffect(() => {
    if (isolatedId < 0) return
    const t = window.setTimeout(() => setRingWeek(week), reduced ? 0 : 1000)
    return () => window.clearTimeout(t)
  }, [isolatedId, week, reduced])

  const step = (dir: 1 | -1) => setWeek((w) => Math.min(WEEKS.length - 1, Math.max(0, w + dir)))

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-56 w-full border border-hairline bg-void-deep"
        role="img"
        aria-label={`Collaboration graph, week ${week + 1} of 8. ${
          isolatedId >= 0 ? `${NODES[isolatedId]?.label} is at silo risk with one connection.` : ''
        }`}
      >
        {ALL_EDGES.map(({ key, a, b }) => {
          const na = NODES[a]!
          const nb = NODES[b]!
          const w = weights.get(key) ?? 0
          return (
            <line
              key={key}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke="rgba(232, 230, 225, 0.55)"
              strokeWidth={0.12 + w * 0.14}
              strokeOpacity={w === 0 ? 0 : 0.2 + w * 0.16}
              style={reduced ? undefined : { transition: 'stroke-opacity 350ms ease-in-out, stroke-width 350ms ease-in-out' }}
            />
          )
        })}
        {NODES.map((n) => (
          <g key={n.id}>
            {n.senior && (
              <path
                d={`M${n.x - 2.4},${n.y} H${n.x + 2.4} M${n.x},${n.y - 2.4} V${n.y + 2.4}`}
                stroke="rgba(232, 230, 225, 0.4)"
                strokeWidth="0.15"
              />
            )}
            <circle cx={n.x} cy={n.y} r={n.senior ? 1.1 : 0.85} fill="#e8e6e1" />
            <text
              x={n.x + 2.2}
              y={n.y + 0.8}
              fontSize="2.4"
              fill="rgba(232, 230, 225, 0.45)"
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}
            >
              {n.label}
            </text>
            {showRing && n.id === isolatedId && (
              <>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={4}
                  fill="none"
                  stroke="#e2b857"
                  strokeWidth="0.2"
                  strokeDasharray="0.8 0.7"
                  style={reduced ? undefined : { animation: 'collab-ring-in 500ms ease-out both' }}
                />
                <text
                  x={n.x}
                  y={n.y + 7.6}
                  fontSize="2.2"
                  textAnchor="middle"
                  fill="#e2b857"
                  style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    letterSpacing: '0.4px',
                    animation: reduced ? undefined : 'collab-ring-in 500ms ease-out both',
                  }}
                >
                  SILO RISK
                </text>
              </>
            )}
          </g>
        ))}
        <style>{`@keyframes collab-ring-in { from { opacity: 0 } to { opacity: 1 } }`}</style>
      </svg>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex items-center gap-3"
          role="group"
          aria-label="Week selector"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') step(-1)
            if (e.key === 'ArrowRight') step(1)
          }}
        >
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={week === 0}
            aria-label="Previous week"
            className="telemetry border border-hairline px-2 py-1 text-[10px] text-ink-mute transition-colors hover:text-ink disabled:opacity-30"
          >
            ←
          </button>
          <span className="telemetry text-[10px] text-ink">
            WEEK {String(week + 1).padStart(2, '0')} / 08
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={week === WEEKS.length - 1}
            aria-label="Next week"
            className="telemetry border border-hairline px-2 py-1 text-[10px] text-ink-mute transition-colors hover:text-ink disabled:opacity-30"
          >
            →
          </button>
        </div>
        <p className="telemetry text-[10px] text-ink-faint">
          REVIEWS {reviews} · PAIRS {(WEEKS[week] ?? []).length} · ISOLATED{' '}
          {isolatedId >= 0 ? 1 : 0}
        </p>
      </div>
    </div>
  )
}
