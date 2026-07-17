const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const TOOLS_DIR = path.join(__dirname, 'tools');
const TOOLS_JSON = path.join(TOOLS_DIR, 'tools.json');

// Scan the tools/ folder for .js files (skip tools.json itself)
// and (re)generate tools.json with a list of { id, name } entries.
// A tool can set its own display name by putting a comment on line 1:
//   // name: My Cool Tool
// Otherwise the filename (without .js) is used, title-cased.
function scanTools() {
  const files = fs.readdirSync(TOOLS_DIR).filter(f => f.endsWith('.js'));

  const tools = files.map(file => {
    const id = path.basename(file, '.js');
    const firstLine = fs.readFileSync(path.join(TOOLS_DIR, file), 'utf8').split('\n')[0];
    const match = firstLine.match(/^\/\/\s*name:\s*(.+)$/);
    const name = match ? match[1].trim() : id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return { id, name };
  });

  fs.writeFileSync(TOOLS_JSON, JSON.stringify(tools, null, 2));
  console.log(`Scanned ${tools.length} tool(s):`, tools.map(t => t.id).join(', '));
  return tools;
}

// Regenerate tools.json every time the server starts/reloads
scanTools();

// Serve tools/ (so /tools/hello.js and /tools/tools.json are fetchable)
app.use('/tools', express.static(TOOLS_DIR));

// Serve the main site
app.use(express.static(path.join(__dirname, 'public')));

// Optional: manual re-scan without restarting the server
app.get('/api/rescan', (req, res) => {
  const tools = scanTools();
  res.json(tools);
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
