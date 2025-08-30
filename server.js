import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Need this for ES modules to get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Railway provides PORT environment variable, fallback to 3000 for local dev
const port = process.env.PORT || 3000;

/**
 * Serve static files from dist directory first (for production builds)
 * Then fallback to root directory for development
 * This setup works for both dev and production environments
 */
app.use(express.static(path.join(__dirname, 'dist'), { 
  maxAge: '1d', // Cache static assets for a day in production
  etag: true    // Enable ETags for better caching
}));

// Fallback to root directory for any files not in dist
app.use(express.static(path.join(__dirname, ''), {
  setHeaders: (res, filePath) => {
    // Make sure TypeScript files are served with correct MIME type
    // This was causing issues during development
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

/**
 * SPA fallback - send index.html for any non-API routes
 * This allows React Router to handle client-side routing
 */
app.get('*', (req, res) => {
  // Try dist/index.html first (production), then fallback to root index.html (dev)
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  const rootIndex = path.join(__dirname, 'index.html');
  
  // In production, dist/index.html should exist
  res.sendFile(distIndex, (err) => {
    if (err) {
      // Fallback to development setup
      res.sendFile(rootIndex);
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 PixelCyberZone server running on port ${port}`);
  console.log(`📱 Visit: http://localhost:${port}`);
});
