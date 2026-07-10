import { site } from '@/content/site'

export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-10 md:px-10">
        <p className="telemetry text-[10px] text-ink-faint">
          © {new Date().getFullYear()} {site.name}
        </p>

        {/* Discovery tray + lunar phase + Morse LED mount here in later milestones. */}
        <div className="flex items-center gap-6" data-footer-instruments />

        <p className="telemetry text-[10px] text-ink-faint" data-colophon>
          Build {__BUILD_COMMIT__} · {__BUILD_DATE__}
        </p>
      </div>
    </footer>
  )
}
