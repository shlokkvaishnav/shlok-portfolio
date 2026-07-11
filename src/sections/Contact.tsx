import { Section } from '@/components/Section'
import { CopyEmail } from '@/components/CopyEmail'
import { site, socials } from '@/content/site'

export function Contact() {
  return (
    <Section id="contact" index="05 — Contact" title="Open a channel">
      <div className="space-y-12" data-reveal-group>
        <div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href={`mailto:${site.email}`}
              data-contact-email
              data-magnetic
              className="inline-block font-display text-[clamp(1.6rem,5.5vw,4rem)] leading-tight text-ink underline decoration-hairline-strong decoration-1 underline-offset-8 transition-colors hover:decoration-gold"
            >
              {site.email}
            </a>
            <CopyEmail />
          </div>
          <p className="telemetry mt-6 text-[11px] text-ink-faint">{site.availability}</p>
        </div>

        <ul className="flex flex-wrap gap-x-10 gap-y-4">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="link-rule group inline-flex items-baseline gap-3"
              >
                <span className="telemetry text-[10px] text-ink-faint">{s.label}</span>
                <span className="text-sm text-ink-mute transition-colors group-hover:text-ink">
                  {s.handle} ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
