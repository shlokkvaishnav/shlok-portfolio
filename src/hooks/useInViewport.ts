import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

/**
 * Tracks whether the referenced element intersects the viewport.
 * With `once`, latches true on first intersection and stops observing.
 */
export function useInViewport<T extends Element>(
  rootMargin = '200px',
  once = false,
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries[0]?.isIntersecting ?? false
        if (once) {
          if (intersecting) {
            setInView(true)
            observer.disconnect()
          }
        } else {
          setInView(intersecting)
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, once])

  return [ref, inView]
}
