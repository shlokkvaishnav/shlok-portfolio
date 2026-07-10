import { useEffect, useRef, useState } from 'react'
import { navItems } from '@/content/site'
import { scrollToSection } from '@/animation/lenis'
import { useScrollStore } from '@/animation/scrollStore'

const RAIL_SECTIONS = [{ id: 'hero', label: 'Top' }, ...navItems] as const

/**
 * Right-edge scroll instrument (desktop only): a full-height hairline with a
 * tick per section and a gold caret mapped 1:1 to scroll position. Ticks stay
 * lit once their section has been visited.
 */
export function ProgressRail() {
  const caretRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  // Sections are in document order, so "visited" is everything up to the
  // deepest section reached this session.
  const [maxSeen, setMaxSeen] = useState(0)
  const active = useScrollStore((s) => s.activeSection)

  // Transient subscription: caret follows progress without re-rendering.
  useEffect(() => {
    return useScrollStore.subscribe((state) => {
      const caret = caretRef.current
      if (caret) caret.style.top = `${state.progress * 100}%`
      const bar = barRef.current
      if (bar) bar.style.transform = `scaleX(${state.progress})`
      const idx = RAIL_SECTIONS.findIndex((s) => s.id === state.activeSection)
      if (idx >= 0) setMaxSeen((m) => (idx > m ? idx : m))
    })
  }, [])

  return (
    <>
      {/* Mobile: a 2px gold progress hairline under the nav strip. */}
      <span
        ref={barRef}
        className="fixed inset-x-0 top-12 z-40 h-[2px] origin-left scale-x-0 bg-gold md:hidden"
        aria-hidden
      />
      <div
        className="fixed top-1/2 right-4 z-40 hidden h-[55vh] -translate-y-1/2 md:block"
        aria-hidden={false}
      >
        <div className="relative h-full w-px bg-hairline">
          <span
            ref={caretRef}
            className="absolute -left-[3px] h-[9px] w-[7px] -translate-y-1/2 bg-gold"
            style={{ top: 0 }}
            aria-hidden
          />
          {RAIL_SECTIONS.map((section, i) => {
            const y = (i / (RAIL_SECTIONS.length - 1)) * 100
            const lit = i <= maxSeen
            return (
              <button
                key={section.id}
                type="button"
                aria-label={`Scroll to ${section.label}`}
                onClick={() => scrollToSection(section.id)}
                className="group absolute -left-[8px] flex h-4 w-4 items-center justify-center"
                style={{ top: `calc(${y}% - 8px)` }}
              >
                <span
                  className={`h-px w-[9px] transition-colors duration-150 ${
                    lit ? 'bg-gold' : 'bg-hairline-strong'
                  } ${active === section.id ? 'w-[13px]' : ''}`}
                  aria-hidden
                />
                <span className="telemetry pointer-events-none absolute right-6 text-[9px] whitespace-nowrap text-ink-mute opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {section.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
