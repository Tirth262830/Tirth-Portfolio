# Tirth Parikh — Portfolio

Personal portfolio site. Plain HTML, CSS and JavaScript — no frameworks, no build step.

## Ideas in it

- **A flammable name.** The hero is a cellular automaton: trees grow in the shape of my name, your cursor is a spark, fire spreads, ash cools, and the forest grows back. A nod to my Forest Fire Prediction project.
- **Watch an agent work.** A live, sped-up demo of an AI agent researching a (made-up) company: confirming its identity, collecting sources, and scoring fit, with every claim tied to a source.
- **Command palette.** Press `Ctrl+K` or `/` to jump around. Try `fire`.
- Scroll reveals, a timeline that fills as you scroll, tilt-and-spotlight project cards, a text scramble, and a magnetic contact button.
- Respects `prefers-reduced-motion` and works on phones.

## Run locally

```sh
python -m http.server 5173
# open http://localhost:5173
```

## Files

- `index.html` — content
- `assets/styles.css` — design
- `assets/forest.js` — the burning-name simulation
- `assets/main.js` — everything else (reveals, agent demo, palette)
