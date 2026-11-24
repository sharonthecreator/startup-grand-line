# Startup Grand Line

An interactive sea chart of the Israeli startup journey, inspired by the Grand Line.

Seven routes leave **Reverse Mountain** — one per sector of Israeli tech. Each route passes five islands (Pre-Seed → Seed → Series A → Growth → Late Stage), crosses the **Red Line** into global markets, and ends at the same treasure island: **the Exit**.

| Route | Sector |
| --- | --- |
| Cipher Strait | Cybersecurity |
| Coin Current | Fintech & Insurtech |
| Play Stream | Consumer, Gaming & Adtech |
| Cloud Channel | AI & Enterprise Software |
| Silicon Run | Mobility, Chips & Deep Tech |
| Green Tide | Climate, Agri & Food Tech |
| Lifeline Passage | Digital Health, Medtech & Bio |

## Using the map

- Click an island and the ship sails there; a panel describes the stage, what happens there and which companies passed through.
- Dashed **cross-currents** connect routes where sectors overlap (for example fraud prevention between cyber and fintech).
- Drag to pan, scroll or pinch to zoom, arrow keys to move along a route.
- Click a route in the legend to highlight it. Visited islands are saved in a logbook in your browser.

## Running it

It is a static site with no build step. Open `index.html`, or serve the folder:

```
python3 -m http.server 8000
```

To publish it, enable GitHub Pages for this repository (Settings → Pages → deploy from a branch, root folder).

## Editing the content

All text lives in `js/data.js`: stages, routes, islands and cross-currents. `js/app.js` draws the map from that data, and `css/style.css` holds the look.

The map is illustrative, not investment advice. Company facts are as publicly reported.
