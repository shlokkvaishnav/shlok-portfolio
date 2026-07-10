import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { detectTier } from '@/scene/quality'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { StaticStarfield } from './StaticStarfield'

const SceneRoot = lazy(() => import('@/scene/SceneRoot'))

/**
 * The fixed sky behind the DOM. The static CSS starfield paints immediately;
 * the WebGL field loads after first paint (idle callback) and develops in
 * over it. Reduced motion, tier 0, and lost contexts keep the static sky.
 */
export function SceneMount() {
  const reduced = useReducedMotion()
  const tier = useMemo(() => detectTier(), [])
  const [wantScene, setWantScene] = useState(false)
  const [sceneLive, setSceneLive] = useState(false)
  const [failed, setFailed] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced || tier === 0) return
    // Safari still lacks requestIdleCallback.
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number
      cancelIdleCallback?: (handle: number) => void
    }
    if (typeof w.requestIdleCallback === 'function') {
      const handle = w.requestIdleCallback(() => setWantScene(true))
      return () => w.cancelIdleCallback?.(handle)
    }
    const handle = window.setTimeout(() => setWantScene(true), 350)
    return () => window.clearTimeout(handle)
  }, [reduced, tier])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const onLost = (e: Event) => {
      e.preventDefault()
      setFailed(true)
    }
    wrap.addEventListener('webglcontextlost', onLost, true)
    return () => wrap.removeEventListener('webglcontextlost', onLost, true)
  }, [])

  const showScene = wantScene && !reduced && !failed && tier > 0

  return (
    <div ref={wrapRef} className="fixed inset-0 -z-10" aria-hidden>
      {/* Static sky fades out as the WebGL field develops in. */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: sceneLive ? 0 : 1 }}
      >
        <StaticStarfield />
      </div>
      {showScene && (
        <Suspense fallback={null}>
          <SceneRoot tier={tier} onFirstFrame={() => setSceneLive(true)} />
        </Suspense>
      )}
    </div>
  )
}
