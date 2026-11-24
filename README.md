# Startup Grand Line

A pirate-adventure sea chart of the Israeli startup journey.

**Live site:** https://sharonthecreator.github.io/startup-grand-line/ (once GitHub Pages is enabled — see below)

## How the chart maps to startups

| On the chart | On the startup sea |
| --- | --- |
| Four origin seas | Where founders come from: Sea of Service = army tech units, Engineers’ Sea = multinational R&D centres, Scholars’ Sea = universities, Returning Sea = serial and immigrant founders |
| Founders’ Peak | Committing to found — every voyage starts with a climb |
| Launch Lighthouse | Incubators, accelerators, Innovation Authority grants |
| The Doldrums | The valley of death: no wind (runway), sea serpents below |
| Home Waters | Seven sector routes, Pre-Seed → Seed → Series A |
| The Market Wall | The limit of a small home market; each route has its own gate (Series B, a US company, a team abroad) |
| Global Waters | Growth and late stage, among the leviathans (Big Tech incumbents) |
| The American Reach / The Far Reaches | The US market / Europe and Asia |
| Four beacons | Four proofs buyers and markets need: Scale, Efficiency, Governance, Moat |
| Exit Island | The Exit — and the treasure goes home to start the next voyage |

The seven routes are Cybersecurity, Fintech & Insurtech, Consumer/Gaming/Adtech, AI & Enterprise Software, Mobility/Chips/Deep Tech, Climate/Agri/Food Tech, and Digital Health/Medtech/Bio. Dashed cross-currents connect routes where sectors overlap.

## Using the map

- Click an island or landmark: the ship sails there and a panel explains what it means for a startup.
- The compass (bottom left) points to your next island and lists other bearings. Click it to sail.
- Drag to pan, scroll or pinch to zoom, arrow keys to move along a route, 📜 Chart key for the full legend.

## Publishing with GitHub Pages

It is a static site with no build step. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick the branch (e.g. `main`) and the `/ (root)` folder, then save. After a minute the site is live at the URL above. On a free GitHub plan the repository must be public for Pages to work.

To run it locally: `python3 -m http.server 8000` and open http://localhost:8000.

## Editing the content

All text lives in `js/data.js` (origin seas, places, beacons, routes, islands, cross-currents). `js/app.js` draws the chart; `css/style.css` holds the look.

An illustrative chart inspired by pirate-adventure stories, not investment advice. Company facts are as publicly reported.
