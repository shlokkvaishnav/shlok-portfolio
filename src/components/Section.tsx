import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  index: string
  title: string
  children: ReactNode
}

/** Shared section shell: hairline top rule, mono index stamp, display heading. */
export function Section({ id, index, title, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-hairline">
      <div className="mx-auto w-full max-w-6xl px-6 py-28 md:px-10 md:py-36">
        <header className="mb-14 md:mb-20" data-section-heading>
          <p className="telemetry mb-4 text-xs text-ink-faint" data-heading-index>
            {index}
          </p>
          <h2
            id={`${id}-title`}
            className="font-display text-4xl leading-[1.05] text-ink md:text-6xl"
            data-heading-title
          >
            {title}
          </h2>
          <div
            className="relative mt-6 h-px w-full origin-left overflow-hidden bg-hairline"
            data-heading-rule
            aria-hidden
          >
            <span
              data-rule-glint
              className="absolute inset-y-0 -left-16 w-16"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(226, 184, 87, 0.7), transparent)',
              }}
            />
          </div>
        </header>
        {children}
      </div>
    </section>
  )
}
