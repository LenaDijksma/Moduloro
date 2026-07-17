const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');

async function loadToolList() {
  const res = await fetch('/tools/tools.json');
  const tools = await res.json();

  sidebar.innerHTML = '';

  if (tools.length === 0) {
    sidebar.innerHTML = '<p class="loading">No tools yet.</p>';
    return;
  }

  tools.forEach(tool => {
    const btn = document.createElement('button');
    btn.textContent = tool.name;
    btn.dataset.id = tool.id;
    btn.addEventListener('click', () => loadTool(tool.id, btn));
    sidebar.appendChild(btn);
  });
}

async function loadTool(id, btnEl) {
  // highlight active button
  document.querySelectorAll('#sidebar button').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  content.innerHTML = '<p>Loading...</p>';

  try {
    // cache-busting query so edited tool files show up without a hard refresh
    const module = await import(`/tools/${id}.js?v=${Date.now()}`);
    content.innerHTML = '';
    module.render(content);
  } catch (err) {
    content.innerHTML = `<p style="color:#f66">Failed to load tool "${id}": ${err.message}</p>`;
    console.error(err);
  }
}

loadToolList();
