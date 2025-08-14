const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;


// Folder with your videos
const VIDEO_DIR = path.join(__dirname, 'videos');
const BLACKLIST_FILE = path.join(__dirname, 'blacklist.json');

function getBlacklist() {
  if (!fs.existsSync(BLACKLIST_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(BLACKLIST_FILE, 'utf-8'));
  } catch (e) {
    console.warn(e);
    return [];
  }
}

function saveBlacklist(list) {
  fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(list, null, 2));
}

// Serve static files (videos & client page)
app.use(express.json());
app.use('/videos', express.static(VIDEO_DIR));
app.use(express.static('ui'))

// Endpoint to get video list
app.get('/list', (req, res) => {
  const blacklist = getBlacklist();
  fs.readdir(VIDEO_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const videos = files.filter(f =>
      ['.mkv'].includes(path.extname(f).toLowerCase())
    ).filter(f => !blacklist.includes(f));

    res.json(videos);
  });
});

app.post('/blacklist', (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'Filename is required' });

  let blacklist = getBlacklist();
  if (!blacklist.includes(filename)) {
    blacklist.push(filename);
    saveBlacklist(blacklist);
  }

  res.json({ success: true, blacklist });
});

// Serve the HTML player
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/ui', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
