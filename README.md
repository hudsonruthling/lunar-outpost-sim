# Outpost Odyssey

A browser-based mission simulator for kids that teaches the real trade-offs of running a lunar or Martian outpost.

## How to play

1. Open `index.html` in a browser.
2. Choose a Moon or Mars outpost.
3. Each turn, choose an action that helps the crew survive.
4. Watch oxygen, food, water, power, and radiation together. A single good choice can create a problem later.
5. If your crew lasts the mission window without losing too much stability, you win.

## NASA data inspiration

This prototype is grounded in real space-science themes and names, including:

- DONKI: solar weather and radiation hazard modeling
- OSDR: astronaut health and radiation research
- Artemis and Mars mission missions as design inspiration for habitat and environmental conditions

The values are simplified for play, but the decision logic matches the real challenge: survival depends on balancing power, shielding, food, and life support.

## Files

- `index.html` — game layout
- `styles.css` — space-themed visual design
- `app.js` — the simulation and mission logic

## Local preview

If you want to serve it locally:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser.

## Mission goals

- Make realistic trade-offs instead of safe-but-empty choices
- Keep resource systems balanced across time
- Teach students that survival in space depends on more than a single perfect action
