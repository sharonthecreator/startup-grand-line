# Startup Grand Line

A One Piece–style sea chart of the Israeli startup journey.

**Live site:** https://sharonthecreator.github.io/startup-grand-line/ (once GitHub Pages is enabled — see below)

## How the lore maps to startups

| On the Grand Line | On the startup sea |
| --- | --- |
| The four Blues | Where founders come from: East Blue = army tech units, West Blue = academia, North Blue = multinational R&D centres, South Blue = serial and immigrant founders |
| Reverse Mountain | The leap: the four currents climb the mountain and merge as founders commit |
| Twin Capes lighthouse | Incubators, accelerators, Innovation Authority grants |
| The Calm Belt | The valley of death: no wind (runway), Sea Kings below |
| Paradise (one-needle Log Pose) | Home waters: seven sector routes, Pre-Seed → Seed → Series A |
| Sabaody Archipelago | All seven routes meet; coating the ship = Series B and setting up in the US |
| The Red Line | The wall of a small home market |
| Fish-Man Island | The dive under the wall: entering the US market |
| Mary Geoise | Lifted over the wall: an early sale to a tech giant |
| The New World (three-needle Log Pose) | Global growth and late stage, ruled by the Emperors (Big Tech incumbents) |
| The four Road Poneglyphs | Four proofs buyers and markets need: Scale, Efficiency, Governance, Moat |
| Laughtale & the One Piece | The Exit — and the money sails round the world back to Reverse Mountain |

The seven routes are Cybersecurity, Fintech & Insurtech, Consumer/Gaming/Adtech, AI & Enterprise Software, Mobility/Chips/Deep Tech, Climate/Agri/Food Tech, and Digital Health/Medtech/Bio. Dashed cross-currents connect routes where sectors overlap.

## Using the map

- Click an island or landmark: the ship sails there and a panel explains the legend and its startup meaning.
- The Log Pose (bottom left) points to your next island — one needle in Paradise, three in the New World. Click it to sail.
- Drag to pan, scroll or pinch to zoom, arrow keys to move along a route, 📜 Chart key for the full legend.

## Publishing with GitHub Pages

It is a static site with no build step. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick the branch (e.g. `main`) and the `/ (root)` folder, then save. After a minute the site is live at the URL above. On a free GitHub plan the repository must be public for Pages to work.

To run it locally: `python3 -m http.server 8000` and open http://localhost:8000.

## Editing the content

All text lives in `js/data.js` (blues, places, poneglyphs, routes, islands, cross-currents). `js/app.js` draws the chart; `css/style.css` holds the look.

A fan-made illustrative chart, not affiliated with One Piece or its creators, and not investment advice. Company facts are as publicly reported.
