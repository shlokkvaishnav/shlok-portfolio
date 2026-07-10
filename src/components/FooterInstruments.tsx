import { useEffect, useMemo, useRef } from 'react'
import { DISCOVERIES, DISCOVERY_IDS, useEggsStore } from '@/eggs/registry'
import { prefersReducedMotion } from '@/hooks/useReducedMotion'
import { moonPath, moonPhaseFraction, moonPhaseName } from '@/utils/moonPhase'

const MORSE_SHLOK = '··· ···· ·−·· −−− −·−'

/** Build steps()-style opacity keyframes for the Morse beacon. */
function morseKeyframes(): { frames: Keyframe[]; duration: number } {
  const UNIT = 220 // ms
  const spans: [on: boolean, units: number][] = []
  for (const ch of MORSE_SHLOK) {
    if (ch === '·') spans.push([true, 1], [false, 1])
    else if (ch === '−') spans.push([true, 3], [false, 1])
    else spans.push([false, 2]) // letter gap (already has 1 trailing off)
  }
  spans.push([false, 7]) // word rest
  const total = spans.reduce((s, [, u]) => s + u, 0) * UNIT
  const frames: Keyframe[] = []
  let t = 0
  for (const [on, units] of spans) {
    frames.push({ opacity: on ? 1 : 0.12, offset: t / total, easing: 'steps(1, end)' })
    t += units * UNIT
  }
  frames.push({ opacity: 0.12, offset: 1 })
  return { frames, duration: total }
}

function MorseBeacon() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const { frames, duration } = morseKeyframes()
    const anim = el.animate(frames, { duration, iterations: Infinity })
    return () => anim.cancel()
  }, [])

  return (
    <span
      ref={ref}
      className="inline-block size-[5px] rounded-full bg-gold opacity-[0.12]"
      role="img"
      aria-label={`Beacon repeating in Morse: ${MORSE_SHLOK}`}
      title="a repeating transmission"
    />
  )
}

function DiscoveryTray() {
  const unlocked = useEggsStore((s) => s.unlocked)
  return (
    <span
      className="flex items-center gap-2"
      aria-label={`Discoveries found: ${unlocked.length} of ${DISCOVERY_IDS.length}`}
    >
      {DISCOVERY_IDS.map((id) => {
        const found = unlocked.includes(id)
        return (
          <span
            key={id}
            title={found ? DISCOVERIES[id].title : 'undiscovered'}
            className={`telemetry text-[10px] transition-colors duration-500 ${
              found ? 'text-gold' : 'text-ink/15'
            }`}
            aria-hidden
          >
            {DISCOVERIES[id].glyph}
          </span>
        )
      })}
    </span>
  )
}

export function FooterInstruments() {
  const phase = useMemo(() => moonPhaseFraction(), [])
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC', [])

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <DiscoveryTray />
      <span className="hidden items-center gap-2 sm:flex">
        <svg viewBox="0 0 14 14" className="size-[14px]" role="img" aria-label={`Current moon: ${moonPhaseName(phase)}`}>
          <circle cx="7" cy="7" r="6.4" fill="none" stroke="rgba(232,230,225,0.25)" strokeWidth="0.5" />
          <path d={moonPath(phase, 6.4)} fill="rgba(232,230,225,0.75)" transform="translate(0.6 0.6)" />
        </svg>
        <span className="telemetry text-[9px] text-ink-faint">
          {moonPhaseName(phase)} · {tz.split('/').pop()?.replace('_', ' ')}
        </span>
      </span>
      <MorseBeacon />
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('sv:terminal'))}
        className="telemetry text-[9px] text-ink-faint transition-colors hover:text-ink"
        aria-label="Open the research console"
      >
        Console
      </button>
    </div>
  )
}
