import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { navItems } from '@/content/site'
import { useScrollStore } from './scrollStore'

/**
 * All scroll-driven DOM choreography, driven off data attributes set in the
 * section markup. Runs once on mount; returns a cleanup function.
 *
 * Motion grammar (see plan): mechanical elements (index stamps, dates) swap
 * with no easing; physical elements (rules, ink, connectors) arrive on
 * expo/power3 curves. Under reduced motion everything is set to its final
 * state and only position-derived updates (nav underline, depth grade) remain.
 */
export function initChoreography(reduced: boolean): () => void {
  const ctx = gsap.context(() => {
    setupHeadings(reduced)
    setupReveals(reduced)
    setupTimelineEntries(reduced)
    setupSectionExits(reduced)
    setupNavTracking()
    setupDepthGrade()
  })
  return () => ctx.revert()
}

function setupHeadings(reduced: boolean): void {
  gsap.utils.toArray<HTMLElement>('[data-section-heading]').forEach((heading) => {
    const index = heading.querySelector('[data-heading-index]')
    const title = heading.querySelector<HTMLElement>('[data-heading-title]')
    const rule = heading.querySelector('[data-heading-rule]')
    if (!index || !title || !rule) return

    if (reduced) return // static markup already is the final state

    const doubled = '0 0.7px 0 rgba(232, 230, 225, 0.55), 0 -0.7px 0 rgba(232, 230, 225, 0.55)'
    const registered = '0 0px 0 rgba(232, 230, 225, 0), 0 0px 0 rgba(232, 230, 225, 0)'
    gsap.set(index, { autoAlpha: 0 })
    gsap.set(title, { opacity: 0.55, textShadow: doubled })
    gsap.set(rule, { scaleX: 0 })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: heading, start: 'top 65%', once: true },
    })
    // Mechanical: the index stamps on with no tween.
    tl.set(index, { autoAlpha: 1 })
      // Physical: rule sweeps, then the doubled title registers and inks in.
      .to(rule, { scaleX: 1, duration: 0.65, ease: 'power3.inOut' }, 0)
      .to(
        title,
        {
          opacity: 1,
          textShadow: registered,
          duration: 0.85,
          ease: 'expo.out',
          onComplete: () => gsap.set(title, { clearProps: 'textShadow' }),
        },
        0.15,
      )
  })
}

function setupReveals(reduced: boolean): void {
  const groups = gsap.utils.toArray<HTMLElement>('[data-reveal-group]')
  groups.forEach((group) => {
    const items = Array.from(group.children) as HTMLElement[]
    if (items.length === 0) return
    if (reduced) return

    gsap.set(items, { opacity: 0.25, y: 8 })
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power3.out',
      stagger: 0.07,
      scrollTrigger: { trigger: group, start: 'top 75%', once: true },
    })
  })
}

function setupTimelineEntries(reduced: boolean): void {
  gsap.utils.toArray<HTMLElement>('[data-timeline-entry]').forEach((entry) => {
    const connector = entry.querySelector('[data-timeline-connector]')
    const node = entry.querySelector('[data-timeline-node]')
    const content = Array.from(entry.children).filter(
      (el) => el !== connector && el !== node,
    ) as HTMLElement[]
    if (reduced) return

    gsap.set(connector, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(node, { opacity: 0 })
    gsap.set(content, { opacity: 0.25, y: 8 })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: entry, start: 'top 60%', once: true },
    })
    tl.to(connector, { scaleX: 1, duration: 0.7, ease: 'expo.out' }, 0)
      .set(node, { opacity: 1 }, 0.2) // mechanical: the node lights, no fade
      .to(content, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06 }, 0.15)
  })
}

function setupSectionExits(reduced: boolean): void {
  if (reduced) return
  gsap.utils.toArray<HTMLElement>('main > section[id]').forEach((section) => {
    const inner = section.firstElementChild
    if (!inner) return
    gsap.to(inner, {
      opacity: 0.45,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'bottom 30%',
        end: 'bottom 0%',
        scrub: true,
      },
    })
  })
}

function setupNavTracking(): void {
  const sections = ['hero', ...navItems.map((n) => n.id)]
  sections.forEach((id) => {
    const el = document.getElementById(id)
    if (!el) return
    const underline = document.querySelector(`[data-nav-underline="${id}"]`)
    ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle(self) {
        if (self.isActive) {
          useScrollStore.setState({ activeSection: id as never })
        }
      },
      onUpdate(self) {
        if (underline && self.isActive) {
          gsap.set(underline, { scaleX: self.progress })
        }
      },
      onLeave() {
        if (underline) gsap.set(underline, { scaleX: 1 })
      },
      onLeaveBack() {
        if (underline) gsap.set(underline, { scaleX: 0 })
      },
    })
  })
}

/**
 * One quantized depth value (0–23) exposed as a CSS custom property and read
 * by the WebGL grade. Written only when the step changes.
 */
function setupDepthGrade(): void {
  let lastStep = -1
  ScrollTrigger.create({
    start: 0,
    end: () => ScrollTrigger.maxScroll(window),
    onUpdate(self) {
      const step = Math.round(self.progress * 23)
      if (step !== lastStep) {
        lastStep = step
        document.documentElement.style.setProperty('--depth', String(step / 23))
      }
    },
  })
}
