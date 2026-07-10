import { useEffect, useRef, useState } from 'react'
import { loadStars, saveStars, STAR_COUNT, unlock } from './registry'
import { onStarHint } from './fx'

interface StarSpec {
  section: string
  x: number // fraction of viewport width
  y: number // fraction of section height
  hidden?: boolean
}

const STARS: readonly StarSpec[] = [
  { section: 'hero', x: 0.86, y: 0.24 },
  { section: 'about', x: 0.07, y: 0.72 },
  { section: 'experience', x: 0.91, y: 0.3 },
  { section: 'projects', x: 0.05, y: 0.55 },
  { section: 'skills', x: 0.89, y: 0.68 },
  { section: 'contact', x: 0.78, y: 0.18, hidden: true },
  { section: 'hero', x: 0.12, y: 0.85, hidden: true },
]

/**
 * Seven faint collectible stars scattered across the page — two visible only
 * while holding F. Collecting all of them completes the constellation.
 * Keyboard path: the stars are real buttons; focus reveals hidden ones.
 */
export function ConstellationLayer() {
  const [collected, setCollected] = useState<ReadonlySet<number>>(() => new Set(loadStars()))
  const [tops, setTops] = useState<number[] | null>(null)
  const [hinting, setHinting] = useState(false)
  const layerRef = useRef<HTMLDivElement>(null)

  // Anchor stars to their sections in document coordinates.
  useEffect(() => {
    const measure = () => {
      const next = STARS.map((s) => {
        const el = document.getElementById(s.section)
        if (!el) return -1
        return el.offsetTop + s.y * el.offsetHeight
      })
      setTops(next)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [])

  // Hold F for the spotlight that reveals the two dark stars.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (e.key.toLowerCase() === 'f') document.body.classList.add('sv-spotlight')
    }
    const up = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f') document.body.classList.remove('sv-spotlight')
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      document.body.classList.remove('sv-spotlight')
    }
  }, [])

  // Konami hint: glow uncollected stars for 10s.
  useEffect(() => {
    return onStarHint(() => {
      setHinting(true)
      window.setTimeout(() => setHinting(false), 10_000)
    })
  }, [])

  const collect = (i: number) => {
    if (collected.has(i)) return
    const next = new Set(collected)
    next.add(i)
    setCollected(next)
    saveStars([...next])
    if (next.size === STAR_COUNT) unlock('constellation')
  }

  if (tops === null) return null

  return (
    <div ref={layerRef} className="absolute inset-x-0 top-0" aria-label="Hidden constellation">
      {STARS.map((star, i) => {
        const top = tops[i] ?? -1
        if (top < 0) return null
        const found = collected.has(i)
        return (
          <button
            key={i}
            type="button"
            onClick={() => collect(i)}
            disabled={found}
            aria-label={found ? 'Collected star' : 'A faint star. Collect it.'}
            className={`sv-star absolute z-30 p-3 ${star.hidden && !found ? 'sv-star-hidden' : ''} ${
              hinting && !found ? 'sv-star-hint' : ''
            }`}
            style={{ top, left: `${star.x * 100}%` }}
          >
            <span
              className={`block size-[5px] rotate-45 transition-colors duration-300 ${
                found ? 'bg-gold' : 'bg-ink/30'
              }`}
              aria-hidden
            />
          </button>
        )
      })}
    </div>
  )
}
