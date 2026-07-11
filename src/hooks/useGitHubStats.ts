import { useEffect, useState } from 'react'

export interface GitHubStats {
  stars: number
  pushedAt: string
}

const CACHE_KEY = 'sv.gh.v1'
const TTL = 24 * 60 * 60 * 1000

type Cache = Record<string, { t: number; v: GitHubStats }>

function readCache(): Cache {
  try {
    return (JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as Cache) ?? {}
  } catch {
    return {}
  }
}

function writeCache(cache: Cache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    /* session-only */
  }
}

/**
 * The site's only network call: lazy, 24h-cached, and failure-silent —
 * returns null on any error or rate limit and the UI renders nothing.
 */
export function useGitHubStats(repoUrl: string, enabled: boolean): GitHubStats | null {
  const [stats, setStats] = useState<GitHubStats | null>(null)

  useEffect(() => {
    if (!enabled) return
    const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/)
    const slug = match?.[1]
    if (!slug) return

    const cached = readCache()[slug]
    if (cached && Date.now() - cached.t < TTL) {
      // Deliver async so the effect body stays render-free.
      const id = window.setTimeout(() => setStats(cached.v), 0)
      return () => window.clearTimeout(id)
    }

    let alive = true
    fetch(`https://api.github.com/repos/${slug}`)
      .then((r) => (r.ok ? (r.json() as Promise<Record<string, unknown>>) : null))
      .then((json) => {
        if (!alive || !json) return
        const v: GitHubStats = {
          stars: typeof json['stargazers_count'] === 'number' ? json['stargazers_count'] : 0,
          pushedAt: typeof json['pushed_at'] === 'string' ? json['pushed_at'] : '',
        }
        setStats(v)
        const cache = readCache()
        cache[slug] = { t: Date.now(), v }
        writeCache(cache)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [repoUrl, enabled])

  return stats
}

export function relativePush(iso: string): string {
  if (!iso) return ''
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'pushed today'
  if (days === 1) return 'pushed yesterday'
  if (days < 30) return `pushed ${days}d ago`
  if (days < 365) return `pushed ${Math.floor(days / 30)}mo ago`
  return `pushed ${Math.floor(days / 365)}y ago`
}
