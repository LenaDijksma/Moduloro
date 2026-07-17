// name: To-Do

export function render(container) {
  const STORAGE_KEY = "todo-list";

  let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  };

  const draw = () => {
    container.innerHTML = `
      <div class="container">
        <h2>To-Do List Maker</h2>

        <div class="todo-add">
          <input id="new-task" class="input" type="text" placeholder="New task...">
          <button id="add-task" class="input">Add</button>
        </div>

        <ul id="task-list">
          ${tasks
            .map(
              (task, i) => `
              <li class="${task.done ? "done" : "unfinished"}, task" data-id="${i}">
                <input class="checkbox" type="checkbox" ${task.done ? "checked" : ""}>
                <span>${escapeHtml(task.text)}</span>
                <button class="delete">✕</button>
              </li>
            `
            )
            .join("")}
        </ul>
      </div>
    `;

    container.querySelector("#add-task").onclick = addTask;

    container.querySelector("#new-task").addEventListener("keydown", e => {
      if (e.key === "Enter") addTask();
    });

    container.querySelectorAll("#task-list li").forEach(li => {
      const id = Number(li.dataset.id);

      li.querySelector("input").onclick = () => {
        tasks[id].done = !tasks[id].done;
        save();
        draw();
      };

      li.querySelector(".delete").onclick = () => {
        tasks.splice(id, 1);
        save();
        draw();
      };
    });
  };

  function addTask() {
    const input = container.querySelector("#new-task");
    const text = input.value.trim();

    if (!text) return;

    tasks.push({
      text,
      done: false
    });

    input.value = "";
    save();
    draw();
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);
  }

  draw();
}