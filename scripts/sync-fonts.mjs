// Copies the exact woff2 subsets the site uses from Fontsource packages into
// public/fonts so they get stable URLs that index.html can preload.
// Runs automatically before `dev` and `build`; public/fonts is gitignored.
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'fonts')

const files = [
  '@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2',
  '@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2',
  '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2',
  '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2',
]

mkdirSync(out, { recursive: true })
for (const file of files) {
  const src = join(root, 'node_modules', file)
  const dest = join(out, file.split('/').at(-1))
  copyFileSync(src, dest)
}
console.log(`[fonts] synced ${files.length} files to public/fonts`)
