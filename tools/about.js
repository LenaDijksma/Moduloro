// name: About

export function render(container) {
    container.innerHTML = `
        <div class="container" style="align-items: stretch; text-align: left; max-width: 720px;">

            <h2 style="align-self: center;">About Moduloro</h2>

            <p>
                Moduloro is a small, self-hosted dashboard for tiny single-purpose
                tools. There's no framework, no bundler, and no build step — just
                a lightweight Express server, plain HTML/CSS, and a handful of
                vanilla JavaScript modules that each do one thing. The whole point
                is that adding a new tool should take minutes, not a new project
                setup.
            </p>

            <h3 style="margin-bottom: 4px;">How it's put together</h3>
            <p>
                The site is split into two halves. <code>public/</code> holds the
                shell: <code>index.html</code>, the shared stylesheet, and
                <code>js/main.js</code>, which fetches the list of available tools
                and swaps their content into the page. <code>tools/</code> holds
                the tools themselves — one file per tool, each exporting a single
                function.
            </p>
            <p>
                When you click a sidebar button, <code>main.js</code> dynamically
                imports that tool's file and calls its exported
                <code>render(container)</code> function, passing in the
                <code>&lt;main id="content"&gt;</code> element. From there, the
                tool is fully responsible for its own markup, styling hooks, and
                event handling — it can build up whatever DOM it needs, attach
                listeners, and read or write its own data.
            </p>
            <p>
                On the server side, <code>server.js</code> re-scans the
                <code>tools/</code> folder every time it starts (or when you hit
                <code>/api/rescan</code>), reading the first line of each file for
                an optional <code>// name: My Tool</code> comment to use as the
                display name. It writes the result out to
                <code>tools/tools.json</code>, which is what the sidebar actually
                loads. If a file doesn't have a name comment, the filename itself
                is title-cased and used instead.
            </p>

            <h3 style="margin-bottom: 4px;">What's included right now</h3>
            <ul style="padding-left: 1.2rem; display: flex; flex-direction: column; gap: 10px;">
                <li><strong>Hello</strong> — the minimal example. A good starting point to copy when building something new.</li>
                <li><strong>Clock</strong> — a live-updating clock that shows your local time and timezone, and demonstrates cleaning up an interval when you navigate away from a tool.</li>
                <li><strong>To-Do</strong> — a classic task list with add, complete, and delete, persisted to <code>localStorage</code> so your list survives a page refresh.</li>
                <li><strong>Kanban</strong> — a drag-and-drop board with To Do / Doing / Done columns. Cards support titles, due dates, and longer descriptions via a detail popup, plus search, keyboard-friendly move buttons, and per-column clearing.</li>
                <li><strong>About</strong> — this page.</li>
            </ul>

            <h3 style="margin-bottom: 4px;">Data &amp; storage</h3>
            <p>
                Tools like To-Do and Kanban don't talk to a database — they store
                their state directly in your browser's <code>localStorage</code>.
                That means your tasks and boards are private to the browser and
                device you're using, persist across reloads and restarts, and are
                never sent to the server. Clearing your browser's site data (or
                switching browsers) will reset them.
            </p>

            <h3 style="margin-bottom: 4px;">Adding your own tool</h3>
            <p>Getting a new tool onto the dashboard takes three steps:</p>
            <ol style="padding-left: 1.2rem; display: flex; flex-direction: column; gap: 6px;">
                <li>Create a new file in <code>tools/</code>, for example <code>tools/notes.js</code>.</li>
                <li>Give it a display name with a comment on the very first line, like <code>// name: Notes</code>, and export a <code>render(container)</code> function that fills in the container's HTML and wires up any behavior.</li>
                <li>Restart the server (or call <code>/api/rescan</code>) so it picks up the new file and adds it to the sidebar automatically — there's nothing else to register by hand.</li>
            </ol>

            <p style="color: var(--color-text-muted); font-size: 0.85rem; align-self: center; margin-top: 8px;">
                Built with vanilla JS and Express — no framework, no build step.
            </p>
        </div>
    `;
}
