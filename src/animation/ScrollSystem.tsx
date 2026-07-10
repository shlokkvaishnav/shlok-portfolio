import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { prefersReducedMotion } from '@/hooks/useReducedMotion'
import { initChoreography } from './choreography'
import { setLenis } from './lenis'
import { useScrollStore } from './scrollStore'

gsap.registerPlugin(ScrollTrigger)

/**
 * The single rAF owner. Lenis drives scroll, ScrollTrigger reads it, and the
 * master trigger writes normalized progress/velocity into the zustand store
 * without causing React re-renders. Renders nothing.
 */
export function ScrollSystem() {
  useLayoutEffect(() => {
    const reduced = prefersReducedMotion()
    useScrollStore.setState({ motionMode: reduced ? 'reduced' : 'full' })

    // Lenis owns scroll position; browser restoration fights its lerp loop
    // and leaves once-triggers in inconsistent states after reload.
    history.scrollRestoration = 'manual'

    let lenis: Lenis | null = null

    if (!reduced) {
      lenis = new Lenis({ lerp: 0.12, anchors: true, autoRaf: true })
      setLenis(lenis)
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.lagSmoothing(0)
    }

    const master = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate(self) {
        useScrollStore.setState({
          progress: self.progress,
          velocity: self.getVelocity() / 1000,
        })
      },
    })

    const cleanupChoreography = initChoreography(reduced)

    // Trigger positions are measured at mount, which can predate late layout
    // shifts (font swap, slow style application). Re-measure once the fonts
    // have settled and again on full load.
    const refresh = () => ScrollTrigger.refresh()
    document.fonts.ready.then(refresh).catch(() => undefined)
    window.addEventListener('load', refresh, { once: true })

    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__ST = ScrollTrigger
    }

    return () => {
      window.removeEventListener('load', refresh)
      cleanupChoreography()
      master.kill()
      lenis?.destroy()
      setLenis(null)
    }
  }, [])

  return null
}
