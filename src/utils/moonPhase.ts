const SYNODIC = 29.53058867
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14)

/** 0 = new, 0.5 = full, computed locally — no network, no permissions. */
export function moonPhaseFraction(date = new Date()): number {
  const days = (date.getTime() - KNOWN_NEW_MOON_UTC) / 86_400_000
  return (((days % SYNODIC) + SYNODIC) % SYNODIC) / SYNODIC
}

export function moonPhaseName(f: number): string {
  if (f < 0.03 || f > 0.97) return 'new moon'
  if (f < 0.22) return 'waxing crescent'
  if (f < 0.28) return 'first quarter'
  if (f < 0.47) return 'waxing gibbous'
  if (f < 0.53) return 'full moon'
  if (f < 0.72) return 'waning gibbous'
  if (f < 0.78) return 'last quarter'
  return 'waning crescent'
}

/**
 * SVG path for the illuminated portion of a moon disc of radius r centered
 * at (r, r). Approximates the terminator with an elliptical arc.
 */
export function moonPath(f: number, r: number): string {
  const waxing = f <= 0.5
  const ill = waxing ? f * 2 : (1 - f) * 2 // 0..1 illuminated fraction
  const k = Math.abs(ill * 2 - 1) * r // terminator ellipse x-radius
  const bulge = ill > 0.5 ? 1 : 0
  // Outer limb on the lit side, then the terminator back.
  const limbSweep = waxing ? 1 : 0
  const termSweep = waxing ? (bulge ? 1 : 0) : bulge ? 0 : 1
  return [
    `M ${r} 0`,
    `A ${r} ${r} 0 0 ${limbSweep} ${r} ${2 * r}`,
    `A ${k} ${r} 0 0 ${termSweep} ${r} 0`,
    'Z',
  ].join(' ')
}
