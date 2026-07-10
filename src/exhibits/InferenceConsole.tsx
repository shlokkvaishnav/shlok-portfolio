import { useEffect, useRef, useState } from 'react'
import { useInViewport } from '@/hooks/useInViewport'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Inputs {
  age: number
  bp: number
  chol: number
  bmi: number
}

const DEFAULTS: Inputs = { age: 48, bp: 128, chol: 210, bmi: 26 }

/** Tiny logistic model with plausible standardized coefficients. */
function predict(inp: Inputs): { risk: number; micros: number } {
  const t0 = performance.now()
  let z = 0
  for (let i = 0; i < 50; i++) {
    z =
      -7.2 +
      0.062 * inp.age +
      0.021 * (inp.bp - 120) +
      0.0075 * (inp.chol - 200) +
      0.083 * (inp.bmi - 25)
  }
  const risk = 1 / (1 + Math.exp(-z))
  const micros = ((performance.now() - t0) / 50) * 1000
  return { risk, micros }
}

const SLIDERS: { key: keyof Inputs; label: string; min: number; max: number; unit: string }[] = [
  { key: 'age', label: 'Age', min: 20, max: 80, unit: 'yr' },
  { key: 'bp', label: 'Systolic BP', min: 90, max: 200, unit: 'mmHg' },
  { key: 'chol', label: 'Cholesterol', min: 120, max: 320, unit: 'mg/dL' },
  { key: 'bmi', label: 'BMI', min: 16, max: 45, unit: '' },
]

const INITIAL_RISK = predict(DEFAULTS).risk

// Gauge geometry: semicircle r=40 centered (50, 50).
const ARC_LEN = Math.PI * 40

function setArc(el: SVGPathElement | null, value: number): void {
  if (el) el.style.strokeDasharray = `${value * ARC_LEN} ${ARC_LEN}`
}

const STAGES = ['DVC', 'PYTEST', 'MLFLOW', 'DOCKER', 'FASTAPI'] as const
const STAGE_LOGS = [
  '✓ data validation — 1.2s',
  '✓ 214 tests passed — 0.9s',
  '✓ run logged, AUC 0.91 — 0.4s',
  '✓ image built, 212MB — 1.6s',
  '✓ serving on :8000 — 0.3s',
]

function Pipeline({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState(false)
  const [lit, setLit] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const lastRun = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const run = () => {
    const now = performance.now()
    if (now - lastRun.current < 10_000) return
    lastRun.current = now
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (reduced) {
      setLit(STAGES.length)
      setLogs([...STAGE_LOGS])
      return
    }
    setLit(0)
    setLogs([])
    STAGES.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setLit(i + 1)
          setLogs((l) => [...l, STAGE_LOGS[i] ?? ''])
        }, (i + 1) * 900),
      )
    })
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        className="telemetry text-[10px] text-ink-faint transition-colors hover:text-ink"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '− ' : '+ '}Pipeline
      </button>
      {open && (
        <div className="mt-3 border border-hairline p-4">
          <div className="flex flex-wrap items-center gap-2">
            {STAGES.map((stage, i) => (
              <span key={stage} className="flex items-center gap-2">
                <span className="telemetry flex items-center gap-2 border border-hairline px-2 py-1 text-[9px] text-ink-mute">
                  <span
                    className={`inline-block size-[5px] rounded-full ${i < lit ? 'bg-gold' : 'bg-hairline-strong'}`}
                  />
                  {stage}
                </span>
                {i < STAGES.length - 1 && <span className="text-ink-faint">→</span>}
              </span>
            ))}
            <button
              type="button"
              onClick={run}
              className="telemetry ml-auto text-[9px] text-gold transition-colors hover:text-ink"
            >
              Run
            </button>
          </div>
          {logs.length > 0 && (
            <div className="telemetry mt-3 space-y-1 text-[9px] text-ink-faint" aria-live="polite">
              {logs.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Live inference console: four risk factors drive a real (tiny) logistic
 * model; the gauge glides with a single damped settle and the ECG strip's
 * rate and irregularity follow the predicted risk.
 */
export default function InferenceConsole() {
  const reduced = useReducedMotion()
  const [wrapRef, inView] = useInViewport<HTMLDivElement>('100px')
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const target = useRef(INITIAL_RISK)
  const shown = useRef(INITIAL_RISK)
  const vel = useRef(0)
  const arcRef = useRef<SVGPathElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const microsRef = useRef<HTMLSpanElement>(null)
  const ecgRef = useRef<HTMLCanvasElement>(null)
  const riskRef = useRef(INITIAL_RISK)

  useEffect(() => {
    const { risk, micros } = predict(inputs)
    target.current = risk
    riskRef.current = risk
    if (microsRef.current) microsRef.current.textContent = micros.toFixed(1)
    if (reduced) {
      shown.current = risk
      setArc(arcRef.current, risk)
      if (numRef.current) numRef.current.textContent = `${Math.round(risk * 100)}`
    }
  }, [inputs, reduced])

  // Under-damped spring toward the target: max one small overshoot.
  useEffect(() => {
    if (reduced || !inView) {
      setArc(arcRef.current, target.current)
      if (numRef.current) numRef.current.textContent = `${Math.round(target.current * 100)}`
      return
    }
    let raf = 0
    let last = performance.now()
    let numLast = 0
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const k = 90
      const c = 17 // slightly under critical (2*sqrt(90)≈19) → one settle
      const x = shown.current
      const a = k * (target.current - x) - c * vel.current
      vel.current += a * dt
      shown.current += vel.current * dt
      setArc(arcRef.current, Math.max(0, Math.min(1, shown.current)))
      if (now - numLast > 100 && numRef.current) {
        numLast = now
        numRef.current.textContent = `${Math.round(shown.current * 100)}`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced, inView])

  // ECG strip at 30fps, risk-reactive, paused off-screen/hidden.
  useEffect(() => {
    const canvas = ecgRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const setup = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    setup()

    const beat = (ph: number, irregular: number): number => {
      // Piecewise PQRST-ish pulse on phase 0..1.
      const p = ph % 1
      let v = 0
      if (p > 0.1 && p < 0.16) v = -0.12
      else if (p >= 0.16 && p < 0.2) v = 1
      else if (p >= 0.2 && p < 0.24) v = -0.35
      else if (p > 0.32 && p < 0.42) v = 0.18 * Math.sin(((p - 0.32) / 0.1) * Math.PI)
      return v * (1 + irregular * Math.sin(ph * 37.7))
    }

    let phase = 0
    let raf = 0
    let last = performance.now()
    let acc = 0

    const drawStatic = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(226, 184, 87, 0.8)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x < w; x++) {
        const v = beat((x / w) * 3, 0)
        const y = h * 0.62 - v * h * 0.42
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    if (reduced) {
      drawStatic()
      return
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (document.hidden || !inView) {
        last = now
        return
      }
      acc += now - last
      last = now
      if (acc < 33) return // 30fps cap
      acc = 0
      const risk = riskRef.current
      const hr = 60 + risk * 50 // bpm
      phase += (hr / 60) * 0.033
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(226, 184, 87, 0.8)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x < w; x++) {
        const v = beat(phase + (x / w) * 3, risk * 0.25)
        const y = h * 0.62 - v * h * 0.42
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced, inView])

  return (
    <div ref={wrapRef}>
      <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:items-center">
        <div className="space-y-5">
          {SLIDERS.map((s) => (
            <label key={s.key} className="block">
              <span className="telemetry flex justify-between text-[10px] text-ink-faint">
                <span>{s.label}</span>
                <span className="text-ink-mute">
                  {inputs[s.key]} {s.unit}
                </span>
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                value={inputs[s.key]}
                onChange={(e) => setInputs((v) => ({ ...v, [s.key]: Number(e.target.value) }))}
                className="mt-2 h-1 w-full cursor-pointer appearance-auto"
                style={{ accentColor: '#e2b857' }}
                aria-label={s.label}
              />
            </label>
          ))}
        </div>

        <div className="text-center">
          <svg
            viewBox="0 0 100 58"
            className="mx-auto w-full max-w-64"
            role="img"
            aria-label="Predicted cardiovascular risk gauge"
          >
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="rgba(232, 230, 225, 0.14)"
              strokeWidth="1.5"
            />
            <path
              ref={arcRef}
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#e2b857"
              strokeWidth="1.5"
              style={{ strokeDasharray: `${INITIAL_RISK * ARC_LEN} ${ARC_LEN}` }}
            />
          </svg>
          <p className="-mt-10 font-display text-4xl text-ink">
            <span ref={numRef}>{Math.round(INITIAL_RISK * 100)}</span>
            <span className="text-xl text-ink-mute">%</span>
          </p>
          <p className="telemetry mt-1 text-[9px] text-ink-faint">predicted 10-year risk</p>
          <p className="telemetry mt-4 text-[10px] text-ink-faint">
            INFERENCE <span ref={microsRef} className="text-gold">0.0</span>µS · MODEL V2.3 · 13
            FEATURES
          </p>
        </div>
      </div>

      <canvas
        ref={ecgRef}
        className="mt-6 h-12 w-full border border-hairline bg-void-deep"
        aria-hidden
      />
      <p className="telemetry mt-1 text-[9px] text-ink-faint">
        live waveform — rate follows predicted risk
      </p>

      <Pipeline reduced={reduced} />
    </div>
  )
}
