import { SPECTRUM_INDEX } from '@/content/projects'

interface SpectrumTagsProps {
  tags: readonly string[]
}

/**
 * Tech stack as emission lines on a dark spectrum band. Each technology sits
 * at a fixed wavelength (x-position) site-wide, so recurring skills are
 * recognizable across cards. Lines carry accessible names via the list items.
 */
export function SpectrumTags({ tags }: SpectrumTagsProps) {
  return (
    <div data-spectrum>
      <div
        className="relative h-9 overflow-hidden border border-hairline bg-void-deep"
        aria-hidden
      >
        {tags.map((tag) => {
          const x = SPECTRUM_INDEX[tag] ?? 0.5
          return (
            <span
              key={tag}
              data-spectrum-line={tag}
              className="absolute top-0 h-full w-px bg-ink/60 transition-colors duration-150"
              style={{ left: `${x * 100}%` }}
              title={tag}
            />
          )
        })}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {tags.map((tag) => (
          <li key={tag} className="telemetry text-[10px] text-ink-faint">
            {tag}
          </li>
        ))}
      </ul>
    </div>
  )
}
