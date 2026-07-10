import { create } from 'zustand'

export const DISCOVERIES = {
  terminal: { title: 'Terminal opened', glyph: '⌘' },
  constellation: { title: 'Constellation complete', glyph: '✦' },
  konami: { title: 'Old code accepted', glyph: '▲' },
  morse: { title: 'Transmission decoded', glyph: '·' },
  console: { title: 'Signal acknowledged', glyph: '≋' },
  singularity: { title: 'Singularity observed', glyph: '◉' },
  shortcuts: { title: 'Checklist consulted', glyph: '?' },
} as const

export type DiscoveryId = keyof typeof DISCOVERIES
export const DISCOVERY_IDS = Object.keys(DISCOVERIES) as DiscoveryId[]

const KEY = 'sv.discoveries.v1'

function load(): DiscoveryId[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is DiscoveryId => typeof id === 'string' && id in DISCOVERIES)
  } catch {
    return []
  }
}

function save(ids: readonly DiscoveryId[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    // Private mode — discoveries live for the session only.
  }
}

interface EggsState {
  unlocked: readonly DiscoveryId[]
  /** Most recent unlock, consumed by the toast. */
  lastUnlock: DiscoveryId | null
  unlock: (id: DiscoveryId) => void
  clearToast: () => void
}

export const useEggsStore = create<EggsState>((set, get) => ({
  unlocked: typeof window === 'undefined' ? [] : load(),
  lastUnlock: null,
  unlock(id) {
    const { unlocked } = get()
    if (unlocked.includes(id)) return
    const next = [...unlocked, id]
    save(next)
    set({ unlocked: next, lastUnlock: id })
  },
  clearToast() {
    set({ lastUnlock: null })
  },
}))

export const unlock = (id: DiscoveryId): void => useEggsStore.getState().unlock(id)

/* ---- Constellation star progress (7 collectible stars) ---- */

const STARS_KEY = 'sv.stars.v1'
export const STAR_COUNT = 7

export function loadStars(): number[] {
  try {
    const raw = localStorage.getItem(STARS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : []
  } catch {
    return []
  }
}

export function saveStars(ids: readonly number[]): void {
  try {
    localStorage.setItem(STARS_KEY, JSON.stringify(ids))
  } catch {
    /* session-only */
  }
}
