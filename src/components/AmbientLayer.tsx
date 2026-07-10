import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Rare scheduled sky events — one at a time, margins/background only, never
 * near text. Uses WAAPI (compositor-driven transform/opacity) so events stay
 * smooth regardless of main-thread load. Disabled under reduced motion.
 */

interface Shower {
  name: string
  from: string // MM-DD inclusive
  to: string
  angleDeg: number
}

/** Approximate activity windows of the major annual meteor showers. */
const SHOWERS: readonly Shower[] = [
  { name: 'Quadrantids', from: '01-01', to: '01-06', angleDeg: 25 },
  { name: 'Lyrids', from: '04-16', to: '04-26', angleDeg: 130 },
  { name: 'Perseids', from: '08-08', to: '08-16', angleDeg: 45 },
  { name: 'Orionids', from: '10-18', to: '10-24', angleDeg: 100 },
  { name: 'Leonids', from: '11-15', to: '11-19', angleDeg: 80 },
  { name: 'Geminids', from: '12-10', to: '12-16', angleDeg: 60 },
]

function activeShower(now: Date): Shower | null {
  const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return SHOWERS.find((s) => mmdd >= s.from && mmdd <= s.to) ?? null
}

const range = (lo: number, hi: number) => lo + Math.random() * (hi - lo)

export function AmbientLayer() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer || prefersReducedMotion()) return

    const coarse = window.matchMedia('(pointer: coarse)').matches
    const slow = coarse ? 1.5 : 1
    const timers = new Set<number>()
    let disposed = false

    const later = (ms: number, fn: () => void) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        if (!disposed) fn()
      }, ms)
      timers.add(id)
    }

    const spawn = (cls: string, style: Partial<CSSStyleDeclaration>): HTMLSpanElement => {
      const el = document.createElement('span')
      el.className = cls
      Object.assign(el.style, style)
      layer.appendChild(el)
      return el
    }

    /** A 2px speck crossing on a shallow diagonal over ~a minute, glinting. */
    const satellite = () => {
      if (document.hidden) return
      const fromY = range(8, 42)
      const drift = range(-8, 8)
      const dur = range(50_000, 70_000)
      const el = spawn('absolute rounded-full', {
        width: '2px',
        height: '2px',
        background: 'rgba(232, 230, 225, 0.85)',
        top: `${fromY}vh`,
        left: '-1vw',
      })
      const anim = el.animate(
        [
          { transform: 'translate(0, 0)', opacity: 0 },
          { opacity: 0.9, offset: 0.06 },
          { opacity: 0.35, offset: 0.4 },
          { opacity: 0.85, offset: 0.66 },
          { transform: `translate(102vw, ${drift}vh)`, opacity: 0 },
        ],
        { duration: dur, easing: 'linear' },
      )
      anim.onfinish = () => el.remove()
    }

    /** A brief monochrome detector streak in the outer margins. */
    const artifact = () => {
      if (document.hidden) return
      const leftSide = Math.random() < 0.5
      const el = spawn('absolute', {
        width: `${Math.round(range(6, 20))}px`,
        height: '1px',
        background: 'rgba(232, 230, 225, 0.35)',
        top: `${range(5, 95)}vh`,
        left: leftSide ? `${range(0, 7)}vw` : `${range(93, 99)}vw`,
        transform: `rotate(${range(-30, 30)}deg)`,
      })
      later(120, () => el.remove())
    }

    /** A shower meteor: short streak from the radiant direction. */
    const meteor = (angleDeg: number) => {
      if (document.hidden) return
      const rad = (angleDeg * Math.PI) / 180
      const dx = Math.cos(rad)
      const dy = Math.sin(rad)
      const travel = range(160, 260)
      const el = spawn('absolute', {
        width: '54px',
        height: '1px',
        background:
          'linear-gradient(to right, rgba(232,230,225,0), rgba(232,230,225,0.8))',
        top: `${range(5, 55)}vh`,
        left: `${range(10, 85)}vw`,
        transform: `rotate(${angleDeg}deg)`,
      })
      const anim = el.animate(
        [
          { transform: `rotate(${angleDeg}deg) translateX(0)`, opacity: 0 },
          { opacity: 1, offset: 0.15 },
          {
            transform: `rotate(${angleDeg}deg) translateX(${travel * dx >= 0 ? travel : -travel}px)`,
            opacity: 0,
          },
        ],
        { duration: range(300, 500), easing: 'linear' },
      )
      anim.onfinish = () => el.remove()
      void dy
    }

    const scheduleSatellite = () => {
      later(range(240_000, 420_000) * slow, () => {
        satellite()
        scheduleSatellite()
      })
    }
    const scheduleArtifact = () => {
      later(range(120_000, 240_000) * slow, () => {
        artifact()
        scheduleArtifact()
      })
    }
    const shower = activeShower(new Date())
    const scheduleMeteor = () => {
      if (!shower) return
      later(range(20_000, 60_000) * slow, () => {
        meteor(shower.angleDeg)
        scheduleMeteor()
      })
    }

    // First satellite arrives early enough to be discoverable in a real visit.
    later(range(45_000, 90_000), satellite)
    scheduleSatellite()
    scheduleArtifact()
    scheduleMeteor()

    return () => {
      disposed = true
      timers.forEach((id) => window.clearTimeout(id))
      layer.replaceChildren()
    }
  }, [])

  return (
    <div
      ref={layerRef}
      className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
      aria-hidden
    />
  )
}
