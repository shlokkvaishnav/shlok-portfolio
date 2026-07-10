import { useMemo } from 'react'

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

function shadowLayer(count: number, seed: number, alpha: number): string {
  const rand = mulberry32(seed)
  const shadows: string[] = []
  for (let i = 0; i < count; i++) {
    const x = (rand() * 100).toFixed(2)
    const y = (rand() * 100).toFixed(2)
    shadows.push(`${x}vw ${y}vh 0 rgba(232, 230, 225, ${alpha})`)
  }
  return shadows.join(', ')
}

/**
 * Zero-JS-cost sky: two box-shadow star layers over a faint nebula gradient.
 * Serves as the instant backdrop before WebGL is ready, the reduced-motion
 * sky, and the tier-0 / context-lost fallback.
 */
export function StaticStarfield() {
  const layers = useMemo(
    () => ({
      far: shadowLayer(90, 11, 0.35),
      near: shadowLayer(40, 47, 0.6),
    }),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 70% 20%, rgba(20, 32, 54, 0.5), transparent 70%), radial-gradient(ellipse 70% 50% at 25% 75%, rgba(16, 26, 42, 0.42), transparent 70%)',
        }}
      />
      <div
        className="absolute h-px w-px rounded-full"
        style={{ boxShadow: layers.far, top: 0, left: 0 }}
      />
      <div
        className="absolute h-[2px] w-[2px] rounded-full"
        style={{ boxShadow: layers.near, top: 0, left: 0 }}
      />
    </div>
  )
}
