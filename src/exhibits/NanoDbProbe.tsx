import { useEffect, useMemo, useRef, useState } from 'react'
import { useInViewport } from '@/hooks/useInViewport'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const COUNT = 200
const K = 5

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Pt {
  x: number
  y: number
  bright: number
}

const POINTS: readonly Pt[] = (() => {
  const rand = mulberry32(42)
  const pts: Pt[] = []
  // Three loose clusters plus background scatter, like a real embedding space.
  const clusters = [
    { cx: 0.28, cy: 0.34, r: 0.16, n: 70 },
    { cx: 0.68, cy: 0.62, r: 0.14, n: 60 },
    { cx: 0.62, cy: 0.22, r: 0.1, n: 40 },
  ]
  for (const c of clusters) {
    for (let i = 0; i < c.n; i++) {
      const ang = rand() * Math.PI * 2
      const rad = Math.sqrt(rand()) * c.r
      pts.push({
        x: c.cx + Math.cos(ang) * rad * 1.4,
        y: c.cy + Math.sin(ang) * rad,
        bright: rand() > 0.9 ? 0.9 : 0.35 + rand() * 0.3,
      })
    }
  }
  while (pts.length < COUNT) {
    pts.push({ x: 0.05 + rand() * 0.9, y: 0.08 + rand() * 0.84, bright: 0.25 + rand() * 0.3 })
  }
  return pts
})()

const PARKED = { x: 0.46, y: 0.44 }

interface Solve {
  idx: number[]
  dists: number[]
  micros: number
}

function solve(px: number, py: number): Solve {
  const t0 = performance.now()
  const d: { i: number; d: number }[] = []
  for (let i = 0; i < POINTS.length; i++) {
    const p = POINTS[i]!
    const dx = p.x - px
    const dy = p.y - py
    d.push({ i, d: Math.sqrt(dx * dx + dy * dy) })
  }
  d.sort((a, b) => a.d - b.d)
  const micros = (performance.now() - t0) * 1000
  return {
    idx: d.slice(0, K).map((e) => e.i),
    dists: d.slice(0, K).map((e) => e.d),
    micros,
  }
}

function SimdComparator({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState(false)
  const [scalarFill, setScalarFill] = useState(0)
  const [avxFill, setAvxFill] = useState(false)
  const timers = useRef<number[]>([])

  const run = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (reduced) {
      setScalarFill(8)
      setAvxFill(true)
      return
    }
    setScalarFill(0)
    setAvxFill(false)
    for (let i = 1; i <= 8; i++) {
      timers.current.push(window.setTimeout(() => setScalarFill(i), i * 90))
    }
    timers.current.push(window.setTimeout(() => setAvxFill(true), 120))
  }

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  return (
    <div className="mt-4">
      <button
        type="button"
        className="telemetry text-[10px] text-ink-faint transition-colors hover:text-ink"
        aria-expanded={open}
        onClick={() => {
          const next = !open
          setOpen(next)
          if (next) run()
        }}
      >
        {open ? '− ' : '+ '}SIMD Comparator
      </button>
      {open && (
        <div className="mt-3 space-y-2 border border-hairline p-4">
          {(['SCALAR', 'AVX2'] as const).map((row) => (
            <div key={row} className="flex items-center gap-3">
              <span className="telemetry w-14 text-[9px] text-ink-faint">{row}</span>
              <span className="flex gap-1" aria-hidden>
                {Array.from({ length: 8 }, (_, i) => {
                  const filled = row === 'SCALAR' ? i < scalarFill : avxFill
                  return (
                    <span
                      key={i}
                      className={`h-3 w-5 border border-hairline ${filled ? 'bg-gold' : ''}`}
                      style={{ transition: row === 'AVX2' ? 'background-color 120ms linear' : 'none' }}
                    />
                  )
                })}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1">
            <p className="telemetry text-[9px] text-ink-faint">8 floats / instruction</p>
            <button
              type="button"
              onClick={run}
              className="telemetry text-[9px] text-gold transition-colors hover:text-ink"
            >
              Run again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Live k-NN probe: the cursor is a query vector over a 200-point embedding
 * scatter; gold hairlines connect it to its 5 nearest neighbors, re-solved
 * per frame with the real measured scan time printed below.
 */
export default function NanoDbProbe() {
  const reduced = useReducedMotion()
  const [wrapRef, inView] = useInViewport<HTMLDivElement>('100px')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const probeRef = useRef<{ x: number; y: number }>(PARKED)
  const rafPending = useRef(false)
  const micros = useRef<number[]>([])
  const [coarse] = useState(() => window.matchMedia('(pointer: coarse)').matches)
  const [readout, setReadout] = useState<Solve & { med: number }>(() => {
    const s = solve(PARKED.x, PARKED.y)
    return { ...s, med: s.micros }
  })
  const lastReadout = useRef(0)

  const draw = useMemo(() => {
    return () => {
      rafPending.current = false
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== w * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const probe = probeRef.current
      const result = solve(probe.x, probe.y)
      micros.current.push(result.micros)
      if (micros.current.length > 10) micros.current.shift()

      const near = new Set(result.idx)
      // Neighbor hairlines first, points on top.
      ctx.strokeStyle = 'rgba(226, 184, 87, 0.65)'
      ctx.lineWidth = 1
      for (const i of result.idx) {
        const p = POINTS[i]!
        ctx.beginPath()
        ctx.moveTo(probe.x * w, probe.y * h)
        ctx.lineTo(p.x * w, p.y * h)
        ctx.stroke()
      }
      for (let i = 0; i < POINTS.length; i++) {
        const p = POINTS[i]!
        const hot = near.has(i)
        ctx.fillStyle = hot
          ? 'rgba(226, 184, 87, 0.95)'
          : `rgba(232, 230, 225, ${p.bright})`
        const r = hot ? 2.4 : p.bright > 0.8 ? 1.8 : 1.2
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2)
        ctx.fill()
      }
      // The probe itself: gold cross.
      ctx.strokeStyle = 'rgba(226, 184, 87, 1)'
      const px = probe.x * w
      const py = probe.y * h
      ctx.beginPath()
      ctx.moveTo(px - 5, py)
      ctx.lineTo(px + 5, py)
      ctx.moveTo(px, py - 5)
      ctx.lineTo(px, py + 5)
      ctx.stroke()

      const now = performance.now()
      if (now - lastReadout.current > 66) {
        lastReadout.current = now
        const sorted = [...micros.current].sort((a, b) => a - b)
        setReadout({ ...result, med: sorted[Math.floor(sorted.length / 2)] ?? result.micros })
      }
    }
  }, [])

  const requestDraw = () => {
    if (!rafPending.current) {
      rafPending.current = true
      requestAnimationFrame(draw)
    }
  }

  useEffect(() => {
    if (inView) requestDraw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced])

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    probeRef.current = {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    }
    requestDraw()
  }

  return (
    <div ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="h-60 w-full cursor-crosshair touch-none border border-hairline bg-void-deep"
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        role="img"
        aria-label="Interactive scatter of 200 embedding points. Your cursor is a query vector; lines connect it to its five nearest neighbors."
      />
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="telemetry text-[10px] text-ink-faint" aria-live="off">
          K5{' '}
          {readout.dists.map((d, i) => (
            <span key={i} className="ml-2 text-ink-mute">
              {d.toFixed(3)}
            </span>
          ))}
        </p>
        <p className="telemetry text-[10px] text-gold">QUERY {readout.med.toFixed(0)}µS</p>
      </div>
      <p className="telemetry mt-1 text-[9px] text-ink-faint">
        {coarse ? 'tap to place a query vector' : 'your cursor is the query vector'}
      </p>
      <SimdComparator reduced={reduced} />
    </div>
  )
}
