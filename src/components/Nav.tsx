import { useEffect, useRef, useState } from 'react'
import { navItems } from '@/content/site'
import type { SectionId } from '@/content/site'
import { useScrollStore } from '@/animation/scrollStore'

const LABELS: Record<SectionId, string> = {
  hero: 'Intro',
  about: 'About',
  experience: 'Experience',
  projects: 'Projects',
  skills: 'Skills',
  contact: 'Contact',
}

/** Masked vertical roll showing the section currently in view. */
function CurrentSection() {
  const active = useScrollStore((s) => s.activeSection)
  const prevRef = useRef<SectionId>(active)
  const [pair, setPair] = useState<{ prev: SectionId | null; cur: SectionId }>({
    prev: null,
    cur: active,
  })

  useEffect(() => {
    if (active !== prevRef.current) {
      setPair({ prev: prevRef.current, cur: active })
      prevRef.current = active
    }
  }, [active])

  return (
    <span
      className="telemetry relative block h-[1.1em] w-24 overflow-hidden text-[10px] text-ink-faint"
      aria-hidden
    >
      <span key={pair.cur} className="nav-roll-in block">
        {LABELS[pair.cur]}
      </span>
      {pair.prev !== null && (
        <span key={`${pair.prev}-out`} className="nav-roll-out absolute inset-0">
          {LABELS[pair.prev]}
        </span>
      )}
    </span>
  )
}

export function Nav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 top-0 z-40 border-b border-hairline bg-void/75 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-6 md:px-10">
        <span className="flex items-baseline gap-6">
          <a href="#hero" className="telemetry text-xs text-ink transition-colors hover:text-gold">
            SV
          </a>
          <span className="hidden md:block">
            <CurrentSection />
          </span>
        </span>
        <ul className="flex items-center gap-5 md:gap-8">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                data-nav-link={item.id}
                className="telemetry relative block py-1 text-[11px] text-ink-mute transition-colors hover:text-ink"
              >
                {item.label}
                <span
                  data-nav-underline={item.id}
                  className="absolute right-0 bottom-0 left-0 h-px origin-left scale-x-0 bg-gold"
                  aria-hidden
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
