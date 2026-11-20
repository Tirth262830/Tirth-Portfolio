# Tirth Parikh — Portfolio

Live: https://tirth-portfolio-theta.vercel.app

Plain HTML, CSS and JavaScript. No framework, no build step. Pushing to `main` deploys on Vercel.

## What's in it

- **A flammable name.** The hero is a cellular automaton: trees grow in the shape of my name, the cursor is a spark, fire spreads, ash cools and the forest grows back.
- **Case studies.** Every project opens in a side panel: problem, what I built, how it works, result. Deep links work, e.g. `/#case-webmcp`.
- **Ask Tirth.** A small assistant that answers questions about me only from facts written in `assets/data.js`, and links each answer to its source on the page. It is a keyword search, not an LLM, so it can't make things up and costs nothing to run.
- **Live GitHub.** Recent repos and language mix, fetched from the GitHub API when the section comes into view (cached for 30 minutes).
- **Agent demo.** A sped-up research agent at work, with a made-up company.
- **Resume page** (`resume.html`) that prints cleanly to PDF.
- Command palette (`Ctrl+K` or `/`), scroll progress, reveal animations, link-preview image, structured data for search engines, 404 page.
- Respects `prefers-reduced-motion` and works on phones.

## Editing

| To change | Edit |
| --- | --- |
| Project case studies, assistant answers | `assets/data.js` |
| Page text and sections | `index.html` |
| Resume | `resume.html` |
| Burning-name simulation | `assets/forest.js` |

## Run locally

```sh
python -m http.server 5173
# open http://localhost:5173
```
