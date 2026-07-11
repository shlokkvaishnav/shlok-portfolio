import { lazy, Suspense } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import { Section } from '@/components/Section'
import { SpectrumTags } from '@/components/SpectrumTags'
import { projects } from '@/content/projects'
import type { ExhibitKind, Project } from '@/content/types'
import { useInViewport } from '@/hooks/useInViewport'

const EXHIBITS: Record<ExhibitKind, LazyExoticComponent<ComponentType>> = {
  nanodb: lazy(() => import('@/exhibits/NanoDbProbe')),
  climate: lazy(() => import('@/exhibits/EquationAblation')),
  meridian: lazy(() => import('@/exhibits/CollabGraph')),
  cardio: lazy(() => import('@/exhibits/InferenceConsole')),
}

/** Fixed heights per exhibit so lazy mounting causes zero layout shift. */
const EXHIBIT_MIN_H: Record<ExhibitKind, string> = {
  nanodb: 'min-h-[19rem]',
  climate: 'min-h-[17rem]',
  meridian: 'min-h-[19rem]',
  cardio: 'min-h-[21rem]',
}

function ExhibitStage({ kind }: { kind: ExhibitKind }) {
  const [ref, mounted] = useInViewport<HTMLDivElement>('320px', true)
  const Exhibit = EXHIBITS[kind]
  return (
    <div ref={ref} data-exhibit-stage={kind} className={`mt-8 ${EXHIBIT_MIN_H[kind]}`}>
      {mounted && (
        <Suspense fallback={null}>
          <Exhibit />
        </Suspense>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      data-exhibit={project.exhibit}
      className="group relative border border-hairline p-6 md:p-10"
    >
      {/* Gold light cone that warms up when the exhibit arrives. */}
      <div
        data-light-cone
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(226, 184, 87, 0.06), transparent 70%)',
        }}
      />
      {/* Corner hairlines that extend outward on hover. */}
      <span className="exhibit-corner exhibit-corner-tl" aria-hidden />
      <span className="exhibit-corner exhibit-corner-tr" aria-hidden />
      <span className="exhibit-corner exhibit-corner-br" aria-hidden />
      <span className="exhibit-corner exhibit-corner-bl" aria-hidden />

      <div className="flex flex-wrap items-baseline justify-between gap-4" data-exhibit-meta>
        <h3 className="font-display text-3xl text-ink md:text-4xl">{project.title}</h3>
        <p className="telemetry text-[10px] text-ink-faint">
          {project.year} · {project.category} · {project.status}
        </p>
      </div>

      <p className="mt-2 font-display text-lg text-ink-mute italic">{project.tagline}</p>
      <p className="mt-5 max-w-prose leading-relaxed text-ink-mute">{project.description}</p>

      {/* Playable exhibit mounts here (lazy) — static fallback is the card itself. */}
      <ExhibitStage kind={project.exhibit} />

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <SpectrumTags tags={project.tags} />
        <div className="flex gap-6">
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="telemetry text-[11px] text-ink-mute transition-colors hover:text-ink"
          >
            GitHub ↗
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="telemetry text-[11px] text-gold transition-colors hover:text-ink"
            >
              Live ↗
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export function Projects() {
  return (
    <Section id="projects" index="03 — Projects" title="Built to understand">
      <div className="space-y-10 md:space-y-14">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </Section>
  )
}
