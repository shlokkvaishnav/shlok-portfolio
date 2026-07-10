/**
 * Cross-cutting egg effects that the WebGL scene reads each frame.
 * Kept as a plain module so the scene chunk doesn't need React context.
 */

let singularityStart: number | null = null

export function triggerSingularity(): void {
  singularityStart = performance.now()
}

/** Envelope 0→1→0 over ~8s; 0 when inactive. */
export function singularityStrength(now: number): number {
  if (singularityStart === null) return 0
  const t = (now - singularityStart) / 8000
  if (t >= 1) {
    singularityStart = null
    return 0
  }
  // Smooth rise (1.5s), long hold, smooth release.
  const rise = Math.min(1, t / 0.19)
  const fall = Math.min(1, (1 - t) / 0.25)
  return Math.min(rise, fall)
}

/* Konami hint: uncollected constellation stars glow briefly. */

type HintHandler = () => void
const hintHandlers = new Set<HintHandler>()

export function onStarHint(handler: HintHandler): () => void {
  hintHandlers.add(handler)
  return () => hintHandlers.delete(handler)
}

export function emitStarHint(): void {
  hintHandlers.forEach((h) => h())
}
