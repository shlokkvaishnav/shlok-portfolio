import { useEffect, useRef } from 'react'

const SHORTCUTS: readonly [string, string][] = [
  ['`', 'open / close the terminal'],
  ['F (hold)', 'reveal what hides in the dark'],
  ['?', 'this checklist'],
  ['Esc', 'close panels'],
]

export function ShortcutsOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-50 grid place-items-center bg-void/80 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm border border-hairline bg-void p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between">
          <p className="telemetry text-[10px] text-ink-faint">Flight checklist</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="telemetry text-[10px] text-ink-mute transition-colors hover:text-ink"
          >
            Esc
          </button>
        </div>
        <ul className="mt-5 space-y-3">
          {SHORTCUTS.map(([key, what]) => (
            <li key={key} className="flex items-baseline justify-between gap-6">
              <span className="telemetry border border-hairline px-2 py-1 text-[10px] text-gold">
                {key}
              </span>
              <span className="text-right text-sm text-ink-mute">{what}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
