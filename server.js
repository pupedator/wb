import express from 'express';
import path from 'path';
const app = express();
const port = process.env.PORT || 3005;

// Serve all files in the root directory
// We also set a custom header for .tsx and .ts files to ensure they are treated as JavaScript modules by the browser.
app.use(express.static(path.join(__dirname, ''), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

// For any other unhandled requests, send back the main index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});