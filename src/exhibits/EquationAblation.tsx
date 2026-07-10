import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Term = 'ln' | 't4' | 'eps'

const W = 100
const H = 52
const N = 40

/** Synthetic observed series and the four fitted curves, precomputed once. */
const CURVES = (() => {
  const xs = Array.from({ length: N }, (_, i) => i / (N - 1))
  const noise = (i: number) => Math.sin(i * 12.9898) * 0.6 + Math.sin(i * 4.1414) * 0.4

  const truth = (t: number, i: number) =>
    0.62 * Math.log(1 + 2.6 * t) - 0.18 * Math.pow(t, 4) + 0.05 * noise(i)

  const observed = xs.map((t, i) => truth(t, i))
  const fits: Record<'full' | Term, number[]> = {
    full: xs.map((t, i) => truth(t, i) * 0.985 + 0.004 * Math.sin(i)),
    ln: xs.map((t) => 0.34 * t - 0.1 * Math.pow(t, 4)), // forcing removed: linear underfit
    t4: xs.map((t) => 0.62 * Math.log(1 + 2.6 * t) + 0.06 * t), // no radiative loss: runs hot
    eps: xs.map((t) => 0.62 * Math.log(1 + 2.6 * t) - 0.18 * Math.pow(t, 4)), // misses variance
  }

  const yMin = -0.1
  const yMax = 0.75
  const toXY = (v: number, i: number): [number, number] => [
    (i / (N - 1)) * (W - 8) + 4,
    H - 6 - ((v - yMin) / (yMax - yMin)) * (H - 12),
  ]
  const toPath = (vals: number[]) =>
    vals
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${toXY(v, i)[0].toFixed(2)},${toXY(v, i)[1].toFixed(2)}`)
      .join(' ')

  const rmse = (vals: number[]) =>
    Math.sqrt(vals.reduce((s, v, i) => s + (v - (observed[i] ?? 0)) ** 2, 0) / N)

  const base = rmse(fits.full)
  return {
    observedPath: toPath(observed),
    points: fits,
    toPath,
    deltas: {
      full: 0,
      ln: rmse(fits.ln) - base,
      t4: rmse(fits.t4) - base,
      eps: rmse(fits.eps) - base,
    } as Record<'full' | Term, number>,
  }
})()

const TERM_LABEL: Record<Term, string> = {
  ln: 'λ·ln(C/C₀)',
  t4: 'κ·ΔT⁴',
  eps: 'ε(t)',
}

/**
 * Term ablation: hold (or toggle) a term of the discovered equation to remove
 * it from the fit and watch the gold curve degrade while ΔRMSE counts up.
 */
export default function EquationAblation() {
  const reduced = useReducedMotion()
  const [ablated, setAblated] = useState<Term | null>(null)
  const [coarse] = useState(() => window.matchMedia('(pointer: coarse)').matches)
  const pathRef = useRef<SVGPathElement>(null)
  const rmseRef = useRef<HTMLSpanElement>(null)
  const animRef = useRef<number | null>(null)
  const current = useRef<number[]>([...CURVES.points.full])

  useEffect(() => {
    const targetKey = ablated ?? 'full'
    const target = CURVES.points[targetKey]
    const delta = CURVES.deltas[targetKey]
    const duration = ablated ? 400 : 250

    if (animRef.current !== null) cancelAnimationFrame(animRef.current)

    const apply = (vals: number[], d: number) => {
      pathRef.current?.setAttribute('d', CURVES.toPath(vals))
      if (rmseRef.current) rmseRef.current.textContent = d.toFixed(3)
    }

    if (reduced) {
      current.current = [...target]
      apply(target, delta)
      return
    }

    const from = [...current.current]
    const fromDelta = Number(rmseRef.current?.textContent ?? 0)
    const t0 = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      const e = 1 - Math.pow(1 - t, 3)
      const vals = from.map((v, i) => v + ((target[i] ?? v) - v) * e)
      current.current = vals
      apply(vals, fromDelta + (delta - fromDelta) * e)
      if (t < 1) animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current)
    }
  }, [ablated, reduced])

  const termProps = (term: Term) => ({
    'aria-pressed': ablated === term,
    'aria-label': `Ablate term ${TERM_LABEL[term]}`,
    className: `inline cursor-pointer font-display transition-opacity duration-150 hover:text-gold focus-visible:text-gold ${
      ablated === term ? 'opacity-30' : ''
    }`,
    onPointerDown: () => {
      if (!coarse) setAblated(term)
    },
    onPointerUp: () => {
      if (!coarse) setAblated(null)
    },
    onPointerLeave: () => {
      if (!coarse && ablated === term) setAblated(null)
    },
    onClick: () => {
      if (coarse) setAblated((a) => (a === term ? null : term))
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setAblated((a) => (a === term ? null : term))
      }
    },
  })

  return (
    <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
      <div>
        <p className="font-display text-2xl leading-relaxed text-ink md:text-[1.7rem]">
          ΔT ={' '}
          <button type="button" {...termProps('ln')}>
            λ·ln(C/C₀)
          </button>{' '}
          −{' '}
          <button type="button" {...termProps('t4')}>
            κ·ΔT<sup className="text-base">4</sup>
          </button>{' '}
          +{' '}
          <button type="button" {...termProps('eps')}>
            ε(t)
          </button>
        </p>
        <p className="telemetry mt-4 text-[9px] text-ink-faint">
          {coarse ? 'tap' : 'hold'} a term to remove it from the fit
        </p>
      </div>

      <div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-44 w-full border border-hairline bg-void-deep"
          role="img"
          aria-label="Fitted climate curve against observed data. Removing a term visibly degrades the fit."
          preserveAspectRatio="none"
        >
          <path
            d={CURVES.observedPath}
            fill="none"
            stroke="rgba(232, 230, 225, 0.28)"
            strokeWidth="0.6"
          />
          <path
            ref={pathRef}
            d={CURVES.toPath(CURVES.points.full)}
            fill="none"
            stroke="#e2b857"
            strokeWidth="0.8"
          />
        </svg>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="telemetry text-[10px] text-ink-faint">Observed · Fitted</span>
          <span className="telemetry text-[10px] text-ink-mute">
            ΔRMSE{' '}
            <span ref={rmseRef} className="text-gold">
              0.000
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
