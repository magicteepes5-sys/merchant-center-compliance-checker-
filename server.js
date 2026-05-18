const express = require('express');
const path = require('path');
const app = express();

// Cloud Run supplies the PORT environment variable (defaults to 8080)
const port = process.env.PORT || 8080;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    // Ensure TS/TSX files are served with a type that browsers might attempt to parse
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));

// Handle client-side routing by serving index.html for all non-file requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});