import { Section } from '@/components/Section'
import { experience } from '@/content/experience'

export function Experience() {
  return (
    <Section id="experience" index="02 — Experience" title="Where the work happens">
      <ol className="relative ml-2 space-y-16 border-l border-hairline pl-8 md:ml-4 md:space-y-20 md:pl-14">
        {experience.map((entry) => (
          <li key={entry.id} className="relative" data-timeline-entry>
            {/* Node + connector, drawn on reveal. */}
            <span
              className="absolute top-[7px] -left-8 h-px w-6 bg-gold-dim md:-left-14 md:w-10"
              data-timeline-connector
              aria-hidden
            />
            <span
              className="absolute top-[5px] -left-[37px] size-[5px] rounded-full bg-gold md:-left-[70px]"
              data-timeline-node
              aria-hidden
            />
            <span
              className="absolute top-[5px] -left-[37px] size-[5px] rounded-full border border-gold opacity-0 md:-left-[70px]"
              data-timeline-ping
              aria-hidden
            />
            <p className="telemetry text-[11px] text-ink-faint">
              {entry.start} — {entry.end ?? 'PRESENT'}
            </p>
            <h3 className="mt-3 font-display text-2xl text-ink md:text-3xl">{entry.role}</h3>
            <p className="telemetry mt-1 text-[11px] text-ink-mute">{entry.org}</p>
            <p className="mt-4 max-w-prose leading-relaxed text-ink-mute">{entry.summary}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
