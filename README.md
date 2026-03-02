# attendance-tracking

A web-based summer camp activity tracker for filming, uploading, organizing, and sorting activity videos.

## Features

- Record activity videos directly from your camera and microphone.
- Upload existing videos from your device.
- Capture metadata for each activity:
  - Game type
  - Multiplayer mode
  - Ball games / speed challenges / arts and crafts focus areas
  - Date/time, duration, and speed level
  - Notes
- Store entries in browser local storage.
- Filter and sort your library by type, time, duration, and speed challenge level.

## Run locally

Open `index.html` in a modern browser.

For camera recording, serve the files over localhost:

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.
