export type ExhibitKind = 'nanodb' | 'climate' | 'meridian' | 'cardio'

export interface Project {
  id: string
  title: string
  tagline: string
  description: string
  /** Rendered as spectrum-strip emission lines; names must exist in SPECTRUM_INDEX. */
  tags: readonly string[]
  year: string
  category: string
  status: string
  github: string
  demo: string | null
  exhibit: ExhibitKind
}

export interface ExperienceEntry {
  id: string
  /** e.g. 'APR 2026'; end === null means present. */
  start: string
  end: string | null
  role: string
  org: string
  summary: string
}

export interface Skill {
  name: string
  /** Calibration value 0–100, shown as a gauge reading. */
  level: number
}

export interface SkillGroup {
  label: string
  skills: readonly Skill[]
}

export interface SocialLink {
  label: string
  handle: string
  href: string
}
