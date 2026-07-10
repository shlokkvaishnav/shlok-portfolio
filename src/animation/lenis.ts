import type Lenis from 'lenis'

let instance: Lenis | null = null

export function setLenis(lenis: Lenis | null): void {
  instance = lenis
}

/** The live Lenis instance, or null under reduced motion / before init. */
export function getLenis(): Lenis | null {
  return instance
}

/** Smooth-scroll to a target through Lenis, falling back to native scroll. */
export function scrollToSection(id: string): void {
  const target = document.getElementById(id)
  if (!target) return
  if (instance) {
    instance.scrollTo(target, { duration: 1.2 })
  } else {
    target.scrollIntoView({ behavior: 'auto' })
  }
}
