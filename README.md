# shlokkvaishnav.dev

My portfolio: a scroll-driven night walk through a mountain temple rendered live in Three.js, with the work layered over it as editorial chapters.

[**Visit the site**](https://shlokkvaishnav.dev/)

## Chapters

| Section     | Chapter        | Contents                                                        |
| ----------- | -------------- | --------------------------------------------------------------- |
| `#hero`     | 00 · The Approach | Name, positioning, chapter rail                                |
| `#gate`     | 01 · 参道       | About, and the numbers behind it                                 |
| `#pathways` | 02 · 作品       | Four projects, each a live viewport onto a different camera      |
| `#lessons`  | 03 · 経歴       | Four roles — two of them research                                |
| `#eternity` | 04 · 残光       | Contact: email and handles                                       |
| `footer`    | —              | Technical index and colophon                                     |

## How it is built

A single static `index.html` holding the document, CSS, procedural scene construction, scroll choreography, and interaction logic. A vendored Three.js r149 build provides WebGL without a package manager or build step. The temple, torii, lanterns, moon, terrain, rain, leaves, fog, and post-processing are all constructed at runtime; the project cards are scissored viewports rendering the same scene from four separate cameras.

There is no bundler, no framework, and no runtime network dependency. Fonts and the Three.js runtime are served locally.

## Run locally

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then visit <http://127.0.0.1:4173/>. Any static server works.

## Deployment

Pushing to `main` publishes to GitHub Pages via `.github/workflows/deploy.yml`. The workflow uploads the repository as-is; the only build-time step substitutes the analytics site id from the `UMAMI_SITE_ID` repository variable. Leave it unset and no analytics script is inserted at all.

The custom domain is configured by `CNAME`, and `.nojekyll` keeps Pages from running the files through Jekyll.

## Credits and provenance

The design, scene, and front-end code are adapted from [**Kage**](https://github.com/MengTo/kage) by [Meng To](https://github.com/MengTo) — an interactive five-chapter night walk through a Kyoto mountain temple. The layout system, motion language, procedural scene, and the generated scene plates and foreground cutouts in `secret-pathways-assets/` are his work, reused here with the chapter content rewritten. Kage's repository does not currently grant a licence for reuse or redistribution of its code or artwork.

The vendored Three.js r149 build retains its MIT licence notice.

## Changes from upstream Kage

Beyond replacing the copy, the notable divergences are:

- Four project cards instead of three, with a fifth camera composition added for the new one, and the mosaic extended to three rows.
- A two-by-two experience atlas in place of the two-then-three chapter grid.
- The giant wordmark is set in Onest rather than Kage's bespoke `Wordmark` face, which is a five-glyph subset (`A E G K S`) cut for the word KAGE.
- The wordmark is fitted in clip space and re-centred on the frame, so a longer word cannot walk off the edge on a tall or narrow viewport.
- `overflow-x: clip` on the root, so the bleeding foreground cutouts cannot widen the layout viewport on a phone.
- The hero chapter rail collapses to two columns and then one below 1080px and 820px; upstream held four columns to the narrowest widths.
- Carried over from the previous site: canonical URL, Person JSON-LD, sitemap, `robots.txt`, custom 404, and cookieless Umami analytics.
