import { useId, useState } from 'react'
import type { ReactNode } from 'react'

interface ExpandToggleProps {
  label: string
  children: ReactNode
  /** Controlled mode (used by case-study deep links). */
  open?: boolean
  onToggle?: (open: boolean) => void
}

/**
 * Telemetry-styled expander: a "+ Label" latch button revealing content via
 * the grid-rows trick (CSS-driven height, reduced-motion safe).
 */
export function ExpandToggle({ label, children, open, onToggle }: ExpandToggleProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const contentId = useId()

  const toggle = () => {
    const next = !isOpen
    if (onToggle) onToggle(next)
    if (open === undefined) setInternalOpen(next)
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={toggle}
        className="telemetry text-[10px] text-ink-faint transition-colors hover:text-ink"
      >
        {isOpen ? '− ' : '+ '}
        {label}
      </button>
      <div id={contentId} className="expand-grid" data-open={isOpen}>
        <div>{children}</div>
      </div>
    </div>
  )
}
