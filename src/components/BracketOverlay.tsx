import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '@/hooks/useReducedMotion'

const INTERACTIVE = 'a, button, [data-bracket]'
const PAD = 5

/**
 * One sitewide bracket engine: four 1px corner brackets that snap to the
 * hovered or keyboard-focused interactive element and FLIP between targets.
 * Pointer-fine devices only; the native focus outline remains as fallback
 * (suppressed while the overlay is active).
 */
export function BracketOverlay() {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    if (prefersReducedMotion()) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let current: Element | null = null
    let visible = false

    const move = (target: Element, instant: boolean) => {
      const r = target.getBoundingClientRect()
      const state = {
        x: r.left - PAD,
        y: r.top - PAD,
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
      }
      if (instant || !visible) {
        gsap.set(box, state)
        gsap.to(box, { autoAlpha: 1, duration: 0.15, ease: 'expo.out', overwrite: 'auto' })
      } else {
        gsap.to(box, { ...state, duration: 0.3, ease: 'expo.out', overwrite: 'auto' })
      }
      visible = true
    }

    const hide = () => {
      visible = false
      current = null
      gsap.to(box, { autoAlpha: 0, duration: 0.15, ease: 'power2.out', overwrite: 'auto' })
    }

    const onOver = (e: Event) => {
      const target = (e.target as Element).closest(INTERACTIVE)
      if (!target) return
      if (target === current) return
      current = target
      move(target, false)
    }
    const onOut = (e: PointerEvent) => {
      const to = e.relatedTarget as Element | null
      if (!to || !to.closest(INTERACTIVE)) hide()
    }
    const onFocus = (e: FocusEvent) => {
      const target = e.target as Element
      if (target.matches(INTERACTIVE) && target.matches(':focus-visible')) {
        current = target
        move(target, false)
      }
    }
    const onBlur = () => hide()
    const onDown = () => {
      if (!visible) return
      gsap.fromTo(
        box,
        { '--bracket-color': 'rgba(226, 184, 87, 1)' },
        { '--bracket-color': 'rgba(226, 184, 87, 0.55)', duration: 0.12, ease: 'none' },
      )
    }
    const onScroll = () => {
      if (current) move(current, true)
    }

    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', onBlur)
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', onBlur)
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div
      ref={boxRef}
      className="bracket-box pointer-events-none fixed top-0 left-0 z-50 opacity-0"
      aria-hidden
    >
      <span className="bracket bracket-tl" />
      <span className="bracket bracket-tr" />
      <span className="bracket bracket-br" />
      <span className="bracket bracket-bl" />
    </div>
  )
}
