import { lazy, Suspense, useEffect, useState } from 'react'
import { DISCOVERIES, unlock, useEggsStore, DISCOVERY_IDS } from './registry'
import { emitStarHint } from './fx'
import { ShortcutsOverlay } from './ShortcutsOverlay'

const Terminal = lazy(() => import('./Terminal'))

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

declare global {
  interface Window {
    signal?: () => string
  }
}

function Toast() {
  const lastUnlock = useEggsStore((s) => s.lastUnlock)
  const unlocked = useEggsStore((s) => s.unlocked)
  const clearToast = useEggsStore((s) => s.clearToast)

  useEffect(() => {
    if (lastUnlock === null) return
    const t = window.setTimeout(clearToast, 4200)
    return () => window.clearTimeout(t)
  }, [lastUnlock, clearToast])

  return (
    <div aria-live="polite" className="fixed bottom-6 left-6 z-50">
      {lastUnlock !== null && (
        <p className="telemetry toast-in border border-hairline bg-void/95 px-4 py-3 text-[10px] text-ink">
          <span className="text-gold">◆ Discovery</span> — {DISCOVERIES[lastUnlock].title} ·{' '}
          {unlocked.length}/{DISCOVERY_IDS.length}
        </p>
      )}
    </div>
  )
}

/**
 * Detectors + toast + terminal/shortcuts hosts. Everything here is optional
 * to the site experience and keyboard-reachable; findings persist locally.
 */
export function DiscoverySystem() {
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  useEffect(() => {
    let konamiAt = 0

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

      if (e.key === '`' && !typing) {
        e.preventDefault()
        setTerminalOpen((o) => !o)
        unlock('terminal')
        return
      }
      if (e.key === '?' && !typing) {
        setShortcutsOpen((o) => !o)
        unlock('shortcuts')
        return
      }
      if (e.key === 'Escape') {
        setShortcutsOpen(false)
        return
      }

      // Konami sequence (works anywhere except while typing).
      if (typing) return
      const expected = KONAMI[konamiAt]
      if (e.key === expected) {
        konamiAt += 1
        if (konamiAt === KONAMI.length) {
          konamiAt = 0
          unlock('konami')
          emitStarHint()
        }
      } else {
        konamiAt = e.key === KONAMI[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', onKey)

    // Footer "Console" button (and the only touch path to the terminal).
    const onTerminalEvent = () => {
      setTerminalOpen((o) => !o)
      unlock('terminal')
    }
    window.addEventListener('sv:terminal', onTerminalEvent)

    // The console signal, for devtools openers.
    window.signal = () => {
      unlock('console')
      return 'signal acknowledged. six more anomalies remain.'
    }
    // One styled log; harmless noise for everyone else.
    console.log(
      '%c◆ SV-01 %c faint signal detected — type signal() to acknowledge. (` opens the terminal)',
      'color:#e2b857;font-family:monospace',
      'color:#a4a29c;font-family:monospace',
    )

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('sv:terminal', onTerminalEvent)
      delete window.signal
    }
  }, [])

  return (
    <>
      <Toast />
      <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      {terminalOpen && (
        <Suspense fallback={null}>
          <Terminal onClose={() => setTerminalOpen(false)} />
        </Suspense>
      )}
    </>
  )
}
