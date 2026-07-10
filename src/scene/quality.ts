/**
 * Device quality tiers. Kept free of three.js imports so the pre-load shell
 * can decide whether to fetch the scene chunk at all.
 *
 * 2 — desktop-class: full star count, DPR up to 2
 * 1 — mobile / constrained: reduced stars, DPR capped at 1.5
 * 0 — no usable WebGL: static CSS starfield only
 */
export type QualityTier = 0 | 1 | 2

export function detectTier(): QualityTier {
  if (typeof window === 'undefined') return 0
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!gl) return 0
  } catch {
    return 0
  }

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 8
  const cores = navigator.hardwareConcurrency ?? 8
  if (coarse || memory <= 4 || cores <= 4) return 1
  return 2
}
