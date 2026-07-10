import { create } from 'zustand'
import type { SectionId } from '@/content/site'

export type MotionMode = 'full' | 'reduced'

interface ScrollState {
  /** Normalized document scroll progress, 0–1. */
  progress: number
  /** Smoothed scroll velocity in px/ms (signed). */
  velocity: number
  activeSection: SectionId
  motionMode: MotionMode
}

/**
 * Written imperatively from the scroll system via setState (transient
 * subscriptions) so scrolling never re-renders React. Components that need
 * reactive values subscribe with selectors; render-loop consumers call
 * useScrollStore.getState().
 */
export const useScrollStore = create<ScrollState>(() => ({
  progress: 0,
  velocity: 0,
  activeSection: 'hero',
  motionMode: 'full',
}))
