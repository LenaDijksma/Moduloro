// name: Kanban

export function render(container) {
    const STORAGE = "kanban-board";
    const COLUMNS = [
        { name: "todo", title: "To Do" },
        { name: "doing", title: "Doing" },
        { name: "done", title: "Done" }
    ];

    let cards = JSON.parse(localStorage.getItem(STORAGE) || "[]");
    let searchTerm = "";
    let openCardId = null; // id of card currently shown in modal

    function save() {
        localStorage.setItem(STORAGE, JSON.stringify(cards));
    }

    function timeAgo(ts) {
        if (!ts) return "";
        const diff = Math.max(0, Date.now() - ts);
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    function formatDateTime(ts) {
        if (!ts) return "";
        return new Date(ts).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
        });
    }

    function formatDue(dateStr) {
        if (!dateStr) return "";
        const [y, m, d] = dateStr.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric"
        });
    }

    function isOverdue(card) {
        if (!card.dueDate || card.column === "done") return false;
        const [y, m, d] = card.dueDate.split("-").map(Number);
        const due = new Date(y, m - 1, d, 23, 59, 59);
        return due.getTime() < Date.now();
    }

    function cardMatches(card) {
        if (!searchTerm) return true;
        const haystack = `${card.title} ${card.description || ""}`.toLowerCase();
        return haystack.includes(searchTerm);
    }

    function cardHtml(card) {
        const index = COLUMNS.findIndex(c => c.name === card.column);
        const canMoveLeft = index > 0;
        const canMoveRight = index < COLUMNS.length - 1;
        const overdue = isOverdue(card);

        return `
            <div
                class="kanban-card"
                data-id="${card.id}"
                draggable="true"
                style="${cardMatches(card) ? "" : "display:none"}"
            >
                <div class="kanban-card-top">
                    <div class="card-title">${escape(card.title)}</div>
                    <button class="delete-card" title="Delete card" data-id="${card.id}">✕</button>
                </div>
                <div class="card-meta">
                    <span>
                        ${card.dueDate ? `<span class="card-due ${overdue ? "overdue" : ""}">Due ${formatDue(card.dueDate)}</span>` : timeAgo(card.created)}
                    </span>
                    <div class="card-move">
                        <button class="move-left" ${canMoveLeft ? "" : "disabled"} title="Move left" data-id="${card.id}">◀</button>
                        <button class="move-right" ${canMoveRight ? "" : "disabled"} title="Move right" data-id="${card.id}">▶</button>
                    </div>
                </div>
            </div>
        `;
    }

    function column({ name, title }) {
        const columnCards = cards.filter(c => c.column === name);
        const visibleCount = columnCards.filter(cardMatches).length;

        return `
            <div class="kanban-column" data-column="${name}">
                <h3>
                    <span>${title}</span>
                    <span>${searchTerm ? `${visibleCount}/${columnCards.length}` : columnCards.length}</span>
                </h3>

                <div class="kanban-column-actions">
                    <button class="add-card" data-column="${name}">+ Add Card</button>
                    ${columnCards.length ? `<button class="clear-column" data-column="${name}">Clear</button>` : ""}
                </div>

                <div class="card-list" data-column="${name}">
                    ${columnCards.length
                        ? columnCards.map(cardHtml).join("")
                        : `<div class="card-list-empty">No cards</div>`}
                </div>
            </div>
        `;
    }

    function modalHtml() {
        const card = cards.find(c => c.id === openCardId);
        if (!card) return "";

        return `
            <div class="modal-overlay" id="kanban-modal-overlay">
                <div class="modal" id="kanban-modal">
                    <div class="modal-header">
                        <h3>Task details</h3>
                        <button class="modal-close" id="modal-close" title="Close">✕</button>
                    </div>

                    <div class="modal-field">
                        <label for="modal-title">Title</label>
                        <input id="modal-title" class="input" type="text" value="${escape(card.title)}">
                    </div>

                    <div class="modal-field">
                        <label for="modal-due">Due date</label>
                        <input id="modal-due" type="date" value="${card.dueDate || ""}">
                    </div>

                    <div class="modal-field">
                        <label for="modal-desc">Description</label>
                        <textarea id="modal-desc" placeholder="Add more detail...">${escape(card.description || "")}</textarea>
                    </div>

                    <div class="modal-timestamp">Added ${formatDateTime(card.created)}</div>

                    <div class="modal-actions">
                        <button class="btn btn-danger" id="modal-delete">Delete</button>
                        <div class="modal-actions-right">
                            <button class="btn" id="modal-cancel">Cancel</button>
                            <button class="btn btn-primary" id="modal-save">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function draw() {

        container.innerHTML = `
        <div class="container">

            <h2>Kanban Board</h2>

            <input
                id="kanban-search"
                type="text"
                placeholder="Search..."
                value="${escape(searchTerm)}"
            >

            <div class="kanban-board">
                ${COLUMNS.map(column).join("")}
            </div>

        </div>
        ${modalHtml()}
        `;

        container.querySelectorAll(".add-card").forEach(btn => {
            btn.onclick = () => {
                const title = prompt("Task title");
                if (!title || !title.trim()) return;

                const card = {
                    id: crypto.randomUUID(),
                    title: title.trim(),
                    column: btn.dataset.column,
                    created: Date.now(),
                    dueDate: "",
                    description: ""
                };

                cards.push(card);
                save();

                openCardId = card.id;
                draw();
            };
        });

        container.querySelectorAll(".clear-column").forEach(btn => {
            btn.onclick = () => {
                const col = btn.dataset.column;
                const count = cards.filter(c => c.column === col).length;
                if (!confirm(`Remove all ${count} card(s) from this column?`)) return;

                cards = cards.filter(c => c.column !== col);
                save();
                draw();
            };
        });

        container.querySelectorAll(".delete-card").forEach(btn => {
            btn.onclick = e => {
                e.stopPropagation();
                cards = cards.filter(c => c.id !== btn.dataset.id);
                save();
                draw();
            };
        });

        container.querySelectorAll(".move-left, .move-right").forEach(btn => {
            btn.onclick = e => {
                e.stopPropagation();
                const card = cards.find(c => c.id === btn.dataset.id);
                const index = COLUMNS.findIndex(c => c.name === card.column);
                const delta = btn.classList.contains("move-left") ? -1 : 1;
                const target = COLUMNS[index + delta];

                if (!target) return;

                card.column = target.name;
                save();
                draw();
            };
        });

        container.querySelectorAll(".kanban-card").forEach(cardEl => {
            cardEl.addEventListener("click", () => {
                openCardId = cardEl.dataset.id;
                draw();
            });
        });

        let dragging = null;

        container.querySelectorAll(".kanban-card").forEach(card => {
            card.addEventListener("dragstart", () => {
                dragging = card.dataset.id;
                card.classList.add("dragging");
            });

            card.addEventListener("dragend", () => {
                card.classList.remove("dragging");
                dragging = null;
            });
        });

        container.querySelectorAll(".kanban-column").forEach(col => {
            col.addEventListener("dragover", e => {
                e.preventDefault();
                col.classList.add("drag-over");
            });

            col.addEventListener("dragleave", () => {
                col.classList.remove("drag-over");
            });

            col.addEventListener("drop", () => {
                col.classList.remove("drag-over");
                if (!dragging) return;

                const card = cards.find(c => c.id === dragging);
                card.column = col.dataset.column;

                save();
                draw();
            });
        });

        const search = container.querySelector("#kanban-search");
        if (!openCardId) {
            search.focus();
            search.setSelectionRange(search.value.length, search.value.length);
        }

        search.addEventListener("input", () => {
            searchTerm = search.value.toLowerCase();
            draw();
        });

        // Modal wiring
        const overlay = container.querySelector("#kanban-modal-overlay");
        if (!overlay) return;

        const titleInput = container.querySelector("#modal-title");
        titleInput.focus();
        titleInput.setSelectionRange(titleInput.value.length, titleInput.value.length);

        const closeModal = () => {
            openCardId = null;
            draw();
        };

        overlay.addEventListener("mousedown", e => {
            if (e.target === overlay) closeModal();
        });

        container.querySelector("#modal-close").onclick = closeModal;
        container.querySelector("#modal-cancel").onclick = closeModal;

        container.querySelector("#modal-save").onclick = () => {
            const card = cards.find(c => c.id === openCardId);
            if (!card) return;

            const newTitle = container.querySelector("#modal-title").value.trim();
            if (!newTitle) {
                alert("Title can't be empty.");
                return;
            }

            card.title = newTitle;
            card.dueDate = container.querySelector("#modal-due").value || "";
            card.description = container.querySelector("#modal-desc").value.trim();

            save();
            closeModal();
        };

        container.querySelector("#modal-delete").onclick = () => {
            if (!confirm("Delete this card?")) return;
            cards = cards.filter(c => c.id !== openCardId);
            save();
            closeModal();
        };

        document.addEventListener("keydown", function escHandler(e) {
            if (e.key === "Escape" && container.contains(overlay)) {
                closeModal();
                document.removeEventListener("keydown", escHandler);
            }
        });
    }

    function escape(str) {
        return String(str).replace(/[&<>"']/g, m => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        })[m]);
    }

    draw();
}
