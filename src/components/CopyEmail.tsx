import { useState } from 'react'
import { site } from '@/content/site'

/**
 * Copy-to-clipboard beside the contact email: a mono chip docks in with a
 * 1px gold decay bar that drains over 2s. Re-clicks reset the timer.
 */
export function CopyEmail() {
  const [copiedAt, setCopiedAt] = useState<number | null>(null)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopiedAt(Date.now())
    } catch {
      // Clipboard unavailable (permissions/insecure context) — mailto link remains.
    }
  }

  return (
    <span className="inline-flex items-center gap-4">
      <button type="button" onClick={copy} className="btn-latch telemetry text-[10px]">
        Copy
      </button>
      {copiedAt !== null && (
        <span
          key={copiedAt}
          className="copy-chip telemetry text-[10px] text-gold"
          onAnimationEnd={() => setCopiedAt(null)}
          role="status"
        >
          Copied
          <span className="copy-chip-decay" aria-hidden />
        </span>
      )}
    </span>
  )
}
