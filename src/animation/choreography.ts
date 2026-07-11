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
    setupHero(reduced)
    setupHeadings(reduced)
    setupReveals(reduced)
    setupTimelineEntries(reduced)
    setupSectionExits(reduced)
    setupSkillsRitual(reduced)
    setupExhibitArrivals(reduced)
    setupMagnetic(reduced)
    setupNavTracking()
    setupDepthGrade()
  })
  return () => {
    ctx.revert()
    cleanupFns.forEach((fn) => fn())
    cleanupFns.length = 0
  }
}

/**
 * The one synchronized calibration ritual: every needle sweeps to full scale
 * in unison, holds, drops, then settles onto its true reading with a single
 * asymmetric two-step damp while the numerals roll up in sync.
 */
function setupSkillsRitual(reduced: boolean): void {
  const board = document.querySelector('[data-skills-board]')
  if (!board || reduced) return

  const fills = gsap.utils.toArray<HTMLElement>('[data-gauge-fill]')
  const values = gsap.utils.toArray<HTMLElement>('[data-gauge-value]')

  const sweep = (fill: HTMLElement, value: HTMLElement | undefined, stagger: number) => {
    const level = Number(fill.dataset['gaugeFill'] ?? 0) / 100
    const tl = gsap.timeline({ delay: stagger })
    tl.fromTo(
      fill,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.5, ease: 'power3.in' },
    )
      .to(fill, { scaleX: 0.02, duration: 0.25, ease: 'power2.inOut' }, '+=0.15')
      // Two-step damped settle: +6%, -2%, land.
      .to(fill, { scaleX: Math.min(1, level * 1.06), duration: 0.28, ease: 'power2.out' })
      .to(fill, { scaleX: level * 0.98, duration: 0.14, ease: 'power1.inOut' })
      .to(fill, { scaleX: level, duration: 0.1, ease: 'power1.out' })
    if (value) {
      const target = Number(value.dataset['gaugeValue'] ?? 0)
      const counter = { n: 0 }
      tl.to(
        counter,
        {
          n: target,
          duration: 0.8,
          ease: 'power3.out',
          snap: { n: 1 },
          onUpdate() {
            value.textContent = String(Math.round(counter.n))
          },
        },
        0.5,
      )
    }
    return tl
  }

  gsap.set(fills, { scaleX: 0 })
  values.forEach((v) => (v.textContent = '0'))

  let ritualDone = false
  ScrollTrigger.create({
    trigger: board,
    start: 'top 60%',
    once: true,
    onEnter() {
      fills.forEach((fill, i) => sweep(fill, values[i], i * 0.04))
      window.setTimeout(() => (ritualDone = true), 2200)
    },
  })

  // Hover re-runs one gauge, throttled to once per 3s.
  let lastRerun = 0
  board.addEventListener('pointerover', (e) => {
    if (!ritualDone) return
    const row = (e.target as Element).closest('li')
    if (!row) return
    const now = performance.now()
    if (now - lastRerun < 3000) return
    const fill = row.querySelector<HTMLElement>('[data-gauge-fill]')
    if (!fill) return
    lastRerun = now
    sweep(fill, row.querySelector<HTMLElement>('[data-gauge-value]') ?? undefined, 0)
  })
}

function setupHero(reduced: boolean): void {
  const kickerText = document.querySelector<HTMLElement>('[data-hero-kicker-text]')
  const name = document.querySelector<HTMLElement>('[data-hero-name]')
  const frameTop = document.querySelector<HTMLElement>('[data-hero-frame-half="top"]')
  const frameBottom = document.querySelector<HTMLElement>('[data-hero-frame-half="bottom"]')
  const sub = document.querySelector<HTMLElement>('[data-hero-sub]')
  const ctas = document.querySelector<HTMLElement>('[data-hero-ctas]')
  const hints = gsap.utils.toArray<HTMLElement>('[data-hero-scrollhint]')
  const nav = document.querySelector<HTMLElement>('nav[aria-label="Primary"]')
  if (!kickerText || !name || !frameTop || !frameBottom || !sub || !ctas) return

  // The frame parts on first scroll — scrubbed, reversible, both modes
  // (position-derived motion is permitted under reduced motion).
  gsap
    .timeline({
      scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=80%', scrub: true },
    })
    .to(frameTop, { y: () => -window.innerHeight * 0.3, rotation: -1, opacity: 0.15, ease: 'power1.in' }, 0)
    .to(frameBottom, { y: () => window.innerHeight * 0.3, rotation: 1, opacity: 0.15, ease: 'power1.in' }, 0)
    .to(name, { scale: 0.96, opacity: 0.55, transformOrigin: 'left center', ease: 'none' }, 0)

  if (reduced) return

  // Presence parallax: the name leans gently away from the cursor (±4px).
  const hero = document.getElementById('hero')
  if (hero && window.matchMedia('(pointer: fine)').matches) {
    const toNX = gsap.quickTo(name, 'x', { duration: 0.6, ease: 'power3.out' })
    const toNY = gsap.quickTo(name, 'y', { duration: 0.6, ease: 'power3.out' })
    const onHeroMove = (e: PointerEvent) => {
      toNX((e.clientX / window.innerWidth - 0.5) * -8)
      toNY((e.clientY / window.innerHeight - 0.5) * -8)
    }
    const onHeroLeave = () => {
      toNX(0)
      toNY(0)
    }
    hero.addEventListener('pointermove', onHeroMove, { passive: true })
    hero.addEventListener('pointerleave', onHeroLeave)
    cleanupFns.push(() => {
      hero.removeEventListener('pointermove', onHeroMove)
      hero.removeEventListener('pointerleave', onHeroLeave)
    })
  }

  // Entrance: rule pair draws outward, kicker types on, the name pulls into
  // focus, then supporting lines rise. Skipped entirely if the page loads
  // mid-document (hash link) — the static layout is already the final state.
  if (window.scrollY > 80 || window.location.hash) return

  const fullKicker = kickerText.textContent ?? ''
  const chars = fullKicker.length

  gsap.set([frameTop, frameBottom], { scaleX: 0, transformOrigin: 'center' })
  gsap.set(name, { opacity: 0.35, filter: 'blur(12px)' })
  gsap.set([sub, ctas], { opacity: 0, y: 8 })
  if (hints.length) gsap.set(hints, { opacity: 0 })
  if (nav) gsap.set(nav, { autoAlpha: 0 })
  kickerText.textContent = ''

  const typeState = { count: 0 }
  const tl = gsap.timeline({ paused: true })
  tl.to([frameTop, frameBottom], { scaleX: 1, duration: 0.6, ease: 'power2.inOut' }, 0)
    .to(
      typeState,
      {
        count: chars,
        duration: chars * 0.026,
        ease: 'none',
        onUpdate() {
          kickerText.textContent = fullKicker.slice(0, Math.round(typeState.count))
        },
        onComplete() {
          // Two mechanical caret blinks, then gone.
          const caret = document.createElement('span')
          caret.className = 'kicker-caret'
          caret.setAttribute('aria-hidden', 'true')
          kickerText.after(caret)
          caret.addEventListener('animationend', () => caret.remove())
        },
      },
      0.55,
    )
    .to(
      name,
      {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'expo.out',
        onComplete: () => gsap.set(name, { clearProps: 'filter' }),
      },
      1.4,
    )
    .to(sub, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 2.3)
    .to(ctas, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 2.36)
    .to(hints, { opacity: 1, duration: 0.4, ease: 'power3.out' }, 2.6)
  if (nav) tl.to(nav, { autoAlpha: 1, duration: 0.4, ease: 'power3.out' }, 2.6)

  // Scroll is never locked: any early input jumps the sequence to its end.
  const skip = () => {
    tl.progress(1)
    removeSkips()
  }
  const removeSkips = () => {
    window.removeEventListener('wheel', skip)
    window.removeEventListener('touchstart', skip)
    window.removeEventListener('keydown', skip)
  }
  window.addEventListener('wheel', skip, { passive: true, once: true })
  window.addEventListener('touchstart', skip, { passive: true, once: true })
  window.addEventListener('keydown', skip, { once: true })
  tl.eventCallback('onComplete', removeSkips)

  document.fonts.ready
    .then(() => tl.play())
    .catch(() => tl.play())
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
    const glint = rule.querySelector('[data-rule-glint]')
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
    // One gold glint travels the finished rule.
    if (glint) {
      tl.fromTo(
        glint,
        { x: 0 },
        { x: () => rule.clientWidth + 128, duration: 0.45, ease: 'power2.inOut' },
        0.7,
      )
    }
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

    const ping = entry.querySelector('[data-timeline-ping]')
    const tl = gsap.timeline({
      scrollTrigger: { trigger: entry, start: 'top 60%', once: true },
    })
    tl.to(connector, { scaleX: 1, duration: 0.7, ease: 'expo.out' }, 0)
      .set(node, { opacity: 1 }, 0.2) // mechanical: the node lights, no fade
      .to(content, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06 }, 0.15)
    if (ping) {
      // A single expanding ring as the node lights.
      tl.fromTo(
        ping,
        { opacity: 0.9, scale: 1 },
        { opacity: 0, scale: 2.6, duration: 0.5, ease: 'expo.out' },
        0.2,
      )
    }
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

/**
 * Exhibit arrival: a gold light cone warms up over each project card with
 * two brief flicker dips (the site's one permitted imperfection) while the
 * spectrum-strip emission lines draw in bottom-up.
 */
function setupExhibitArrivals(reduced: boolean): void {
  if (reduced) return
  gsap.utils.toArray<HTMLElement>('article[data-exhibit]').forEach((card) => {
    const cone = card.querySelector('[data-light-cone]')
    const lines = card.querySelectorAll<HTMLElement>('[data-spectrum-line]')
    if (lines.length) gsap.set(lines, { scaleY: 0, transformOrigin: 'bottom' })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: card, start: 'top 50%', once: true },
    })
    if (cone) {
      tl.to(cone, { opacity: 0.7, duration: 0.25, ease: 'power1.in' }, 0)
        .to(cone, { opacity: 0.35, duration: 0.06, ease: 'none' })
        .to(cone, { opacity: 1, duration: 0.23, ease: 'power1.out' })
        .to(cone, { opacity: 0.85, duration: 0.06, ease: 'none' })
        .to(cone, { opacity: 1, duration: 0.1, ease: 'none' })
    }
    if (lines.length) {
      tl.to(lines, { scaleY: 1, duration: 0.3, ease: 'power3.out', stagger: 0.04 }, 0.1)
    }
  })
}

/**
 * Magnetic pull: [data-magnetic] elements lean up to 3px toward a nearby
 * cursor and spring home when it leaves. Fine pointers, full motion only.
 */
function setupMagnetic(reduced: boolean): void {
  if (reduced || !window.matchMedia('(pointer: fine)').matches) return
  const REACH = 80
  const MAX = 3

  const targets = gsap.utils.toArray<HTMLElement>('[data-magnetic]').map((el) => ({
    el,
    toX: gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' }),
    toY: gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' }),
  }))
  if (targets.length === 0) return

  let raf = 0
  let px = 0
  let py = 0
  const apply = () => {
    raf = 0
    for (const t of targets) {
      const r = t.el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = px - cx
      const dy = py - cy
      const d = Math.hypot(dx, dy)
      if (d < REACH) {
        const s = (1 - d / REACH) * MAX
        t.toX((dx / (d || 1)) * s)
        t.toY((dy / (d || 1)) * s)
      } else {
        t.toX(0)
        t.toY(0)
      }
    }
  }
  const onMove = (e: PointerEvent) => {
    px = e.clientX
    py = e.clientY
    if (!raf) raf = requestAnimationFrame(apply)
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  cleanupFns.push(() => {
    window.removeEventListener('pointermove', onMove)
    if (raf) cancelAnimationFrame(raf)
  })
}

/** Listener cleanups that gsap.context can't revert on its own. */
const cleanupFns: Array<() => void> = []

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
