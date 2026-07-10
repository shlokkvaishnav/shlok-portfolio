import { Section } from '@/components/Section'
import { site } from '@/content/site'

export function About() {
  return (
    <Section id="about" index="01 — About" title="Systems, made to last">
      <div className="grid gap-14 md:grid-cols-[1.6fr_1fr] md:gap-20">
        <div className="space-y-6" data-reveal-group>
          {site.about.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="max-w-prose leading-relaxed text-ink-mute">
              {paragraph}
            </p>
          ))}
        </div>

        <aside aria-label="Education" className="self-start border border-hairline p-6" data-reveal-group>
          <p className="telemetry mb-5 text-[10px] text-ink-faint">Education</p>
          <p className="font-display text-2xl text-ink">{site.education.institution}</p>
          <p className="mt-2 text-sm text-ink-mute">{site.education.program}</p>
          <p className="telemetry mt-5 text-[10px] text-ink-faint">{site.education.location}</p>
        </aside>
      </div>
    </Section>
  )
}
