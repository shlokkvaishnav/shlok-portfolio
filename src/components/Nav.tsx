import { navItems } from '@/content/site'

export function Nav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 top-0 z-40 border-b border-hairline bg-void/75 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-6 md:px-10">
        <a href="#hero" className="telemetry text-xs text-ink transition-colors hover:text-gold">
          SV
        </a>
        <ul className="flex items-center gap-5 md:gap-8">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                data-nav-link={item.id}
                className="telemetry text-[11px] text-ink-mute transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
