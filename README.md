# Moduloro

A small, self-hosted dashboard for tiny single-purpose tools. No framework, no
bundler, no build step — just a lightweight Express server, plain HTML/CSS,
and a handful of vanilla JavaScript modules that each do one thing.

## Features

- **Zero-config tool loading** — drop a `.js` file in `tools/` and it shows up
  in the sidebar automatically, no manual registration required.
- **Dynamic ES module imports** — tools are only loaded when clicked, with
  cache-busting so edits show up on reload without restarting the server.
- **Built-in tools**:
  - **Hello** — a minimal example, good starting point for new tools.
  - **Clock** — a live-updating clock showing local time and timezone.
  - **To-Do** — a task list with add/complete/delete, persisted to
    `localStorage`.
  - **Kanban** — a drag-and-drop board (To Do / Doing / Done) with card
    titles, due dates, and descriptions via a detail popup, plus search and
    keyboard-friendly move controls.
  - **About** — an in-app explanation of how the project works.

## Getting started

```bash
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

The port can be overridden with the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Project structure

```
mysite/
├── public/
│   ├── index.html       # page shell (header, sidebar, content area)
│   ├── css/style.css     # shared stylesheet (uses CSS custom properties)
│   └── js/main.js        # loads tools.json, dynamically imports tools
├── tools/
│   ├── tools.json         # auto-generated list of { id, name } for each tool
│   ├── hello.js
│   ├── clock.js
│   ├── to-do.js
│   ├── kanban.js
│   └── about.js
├── server.js              # Express server + tool auto-scanner
└── package.json
```

## How it works

1. On startup, `server.js` scans the `tools/` directory for `.js` files and
   (re)generates `tools/tools.json` — a list of `{ id, name }` entries. You
   can also trigger a re-scan without restarting by hitting `GET
   /api/rescan`.
2. `public/js/main.js` fetches `tools.json` and builds the sidebar, one
   button per tool.
3. Clicking a sidebar button dynamically `import()`s that tool's module and
   calls its exported `render(container)` function, passing in the
   `#content` element. From there the tool owns its own markup, styling
   hooks, and event handling.

## Adding a new tool

1. Create a file in `tools/`, e.g. `tools/notes.js`.
2. Give it a display name with a comment on the first line, and export a
   `render(container)` function:

   ```js
   // name: Notes

   export function render(container) {
     container.innerHTML = `
       <div class="container">
         <h2>Notes</h2>
         <p>Your tool's markup goes here.</p>
       </div>
     `;
   }
   ```

3. Restart the server (or call `/api/rescan`) — the new tool appears in the
   sidebar automatically. No other file needs to be touched.

If you skip the `// name:` comment, the filename is title-cased and used as
the display name instead (e.g. `to-do.js` → "To Do").

## Data & storage

Tools that need to persist data (To-Do, Kanban) use the browser's
`localStorage` directly — there's no database and nothing is sent to the
server. That means your data is private to the browser/device you're using,
survives reloads and restarts, and is cleared if you clear the site's
browser data or switch browsers.

## Styling

`public/css/style.css` defines a shared dark theme using CSS custom
properties (colors, spacing, radius, shadows, transitions) declared in
`:root`, so the whole look can be adjusted from one place. Tools can reuse
existing classes like `.container`, `.input`, and `.btn`, or introduce their
own scoped styles as needed.

## Tech stack

- [Express](https://expressjs.com/) — static file serving and the tool
  auto-scan endpoint
- Vanilla JavaScript (ES modules) — no framework, no bundler
- `localStorage` — per-tool client-side persistence
