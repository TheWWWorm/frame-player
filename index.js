const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Folder with your videos
const VIDEO_DIR = path.join(__dirname, 'videos');

// Serve static files (videos & client page)
app.use('/videos', express.static(VIDEO_DIR));

// Endpoint to get video list
app.get('/list', (req, res) => {
  fs.readdir(VIDEO_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const videos = files.filter(f =>
      ['.mkv'].includes(path.extname(f).toLowerCase())
    );

    res.json(videos);
  });
});

// Serve the HTML player
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/ui', 'index.html'));
});

app.use(express.static('ui'))

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
