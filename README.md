# Summer Camp Attendance Tracker

A lightweight browser-based web app for tracking daily summer camp attendance week by week for each camper.

## Features

- Configure how many weeks the camp runs.
- Choose 5-day (Mon–Fri) or 7-day attendance tracking.
- Add and remove campers.
- Record attendance status for each camper by day and by week:
  - Present
  - Absent
  - Late
  - Excused
- View running per-camper totals across all weeks.
- Data is persisted in `localStorage` so progress remains after refresh.

## Run locally

Because this is a static app, you can open `index.html` directly or run a simple local server.

```bash
python3 -m http.server 4173
```

Then browse to:

- http://localhost:4173/

## Project files

- `index.html` – app structure
- `styles.css` – layout and styles
- `script.js` – attendance logic and persistence
