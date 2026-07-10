import { site, socials } from '@/content/site'

export function Hero() {
  return (
    <section id="hero" aria-label="Introduction" className="relative flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pt-24 pb-16 md:px-10">
        <p className="telemetry mb-6 text-xs text-ink-mute md:text-sm" data-hero-kicker>
          {site.kicker}
        </p>

        {/* Hairline title block — the frame parts on first scroll. */}
        <div className="relative" data-hero-frame>
          <div
            className="pointer-events-none absolute inset-0 border border-hairline"
            data-hero-frame-top
            aria-hidden
          />
          <h1
            className="px-5 py-8 font-display text-[clamp(3.25rem,11vw,8.5rem)] leading-[0.95] text-ink md:px-10 md:py-12"
            data-hero-name
          >
            Shlok Vaishnav
          </h1>
        </div>

        <p className="mt-10 max-w-xl text-base leading-relaxed text-ink-mute md:text-lg" data-hero-sub>
          {site.positioning}
        </p>

        <ul className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3" data-hero-ctas>
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="telemetry text-xs text-ink-mute transition-colors hover:text-ink"
              >
                {s.label} ↗
              </a>
            </li>
          ))}
          <li>
            <a
              href={`mailto:${site.email}`}
              className="telemetry text-xs text-gold transition-colors hover:text-ink"
            >
              Email
            </a>
          </li>
        </ul>
      </div>

      <div
        className="mx-auto mb-10 flex w-full max-w-6xl items-center gap-4 px-6 md:px-10"
        data-hero-scrollhint
        aria-hidden
      >
        <span className="telemetry text-[10px] text-ink-faint">Scroll</span>
        <span className="h-px w-16 bg-hairline-strong" />
      </div>
    </section>
  )
}
