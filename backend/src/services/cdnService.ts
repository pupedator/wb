import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// CDN configuration interface
interface CDNConfig {
  baseUrl: string;
  assetsPath: string;
  cacheDuration: {
    images: number;
    scripts: number;
    styles: number;
    fonts: number;
  };
  enableOptimization: boolean;
  enableVersioning: boolean;
}

// Asset optimization options
interface OptimizationOptions {
  images: {
    quality: number;
    progressive: boolean;
    formats: string[];
  };
  enableWebP: boolean;
  enableAvif: boolean;
}

export class CDNService {
  private static config: CDNConfig = {
    baseUrl: process.env.CDN_BASE_URL || 'https://cdn.pixelcyberzone.com',
    assetsPath: process.env.ASSETS_PATH || './public/assets',
    cacheDuration: {
      images: 31536000, // 1 year
      scripts: 31536000, // 1 year
      styles: 31536000, // 1 year
      fonts: 31536000 // 1 year
    },
    enableOptimization: process.env.NODE_ENV === 'production',
    enableVersioning: true
  };

  private static optimizationOptions: OptimizationOptions = {
    images: {
      quality: 85,
      progressive: true,
      formats: ['webp', 'avif', 'jpeg', 'png']
    },
    enableWebP: true,
    enableAvif: true
  };

  // Asset manifest to track versioned assets
  private static assetManifest: Map<string, string> = new Map();

  // Initialize CDN service
  static async initialize(): Promise<void> {
    console.log('🚀 Initializing CDN service...');
    
    try {
      // Ensure assets directory exists
      await this.ensureDirectoryExists(this.config.assetsPath);
      
      // Load existing asset manifest
      await this.loadAssetManifest();
      
      // Generate optimized assets if in production
      if (this.config.enableOptimization) {
        await this.optimizeAllAssets();
      }
      
      console.log('✅ CDN service initialized successfully');
    } catch (error) {
      console.error('❌ CDN service initialization failed:', error);
      throw error;
    }
  }

  // Generate asset URL with CDN base and versioning
  static getAssetUrl(assetPath: string): string {
    const normalizedPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
    
    if (this.config.enableVersioning && this.assetManifest.has(normalizedPath)) {
      const versionedPath = this.assetManifest.get(normalizedPath);
      return `${this.config.baseUrl}/${versionedPath}`;
    }
    
    return `${this.config.baseUrl}/${normalizedPath}`;
  }

  // Optimize image assets
  static async optimizeImage(inputPath: string, outputDir: string): Promise<string[]> {
    const optimizedPaths: string[] = [];
    const fileName = path.basename(inputPath, path.extname(inputPath));
    const inputBuffer = await fs.readFile(inputPath);
    
    try {
      // Original format optimization
      const originalExt = path.extname(inputPath).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(originalExt)) {
        const optimizedBuffer = await sharp(inputBuffer)
          .jpeg({ 
            quality: this.optimizationOptions.images.quality,
            progressive: this.optimizationOptions.images.progressive 
          })
          .png({ 
            quality: this.optimizationOptions.images.quality,
            progressive: this.optimizationOptions.images.progressive 
          })
          .toBuffer();
        
        const optimizedPath = path.join(outputDir, `${fileName}${originalExt}`);
        await fs.writeFile(optimizedPath, optimizedBuffer);
        optimizedPaths.push(optimizedPath);
      }

      // WebP format
      if (this.optimizationOptions.enableWebP) {
        const webpBuffer = await sharp(inputBuffer)
          .webp({ quality: this.optimizationOptions.images.quality })
          .toBuffer();
        
        const webpPath = path.join(outputDir, `${fileName}.webp`);
        await fs.writeFile(webpPath, webpBuffer);
        optimizedPaths.push(webpPath);
      }

      // AVIF format (next-gen)
      if (this.optimizationOptions.enableAvif) {
        try {
          const avifBuffer = await sharp(inputBuffer)
            .avif({ quality: this.optimizationOptions.images.quality })
            .toBuffer();
          
          const avifPath = path.join(outputDir, `${fileName}.avif`);
          await fs.writeFile(avifPath, avifBuffer);
          optimizedPaths.push(avifPath);
        } catch (error) {
          console.warn(`AVIF optimization failed for ${inputPath}:`, error.message);
        }
      }

      // Generate different sizes for responsive images
      const sizes = [480, 768, 1024, 1920];
      for (const size of sizes) {
        const resizedBuffer = await sharp(inputBuffer)
          .resize(size, null, { withoutEnlargement: true })
          .jpeg({ quality: this.optimizationOptions.images.quality })
          .toBuffer();
        
        const resizedPath = path.join(outputDir, `${fileName}-${size}w.jpg`);
        await fs.writeFile(resizedPath, resizedBuffer);
        optimizedPaths.push(resizedPath);
      }

      return optimizedPaths;
    } catch (error) {
      console.error(`Image optimization failed for ${inputPath}:`, error);
      return [];
    }
  }

  // Generate asset hash for versioning
  static async generateAssetHash(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex').substring(0, 8);
  }

  // Create versioned asset filename
  static async createVersionedAsset(assetPath: string): Promise<string> {
    const hash = await this.generateAssetHash(assetPath);
    const parsedPath = path.parse(assetPath);
    return `${parsedPath.name}.${hash}${parsedPath.ext}`;
  }

  // Optimize all assets in the assets directory
  static async optimizeAllAssets(): Promise<void> {
    console.log('🔧 Optimizing all assets...');
    
    try {
      const assetsDir = this.config.assetsPath;
      const optimizedDir = path.join(assetsDir, 'optimized');
      
      await this.ensureDirectoryExists(optimizedDir);
      
      // Find all image files
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
      const files = await this.findFiles(assetsDir, imageExtensions);
      
      for (const file of files) {
        const relativePath = path.relative(assetsDir, file);
        const outputDir = path.join(optimizedDir, path.dirname(relativePath));
        
        await this.ensureDirectoryExists(outputDir);
        
        if (['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase())) {
          await this.optimizeImage(file, outputDir);
        } else {
          // Copy other files as-is
          const outputPath = path.join(outputDir, path.basename(file));
          await fs.copyFile(file, outputPath);
        }
        
        // Update asset manifest with versioned paths
        if (this.config.enableVersioning) {
          const versionedName = await this.createVersionedAsset(file);
          this.assetManifest.set(relativePath, versionedName);
        }
      }
      
      // Save asset manifest
      await this.saveAssetManifest();
      
      console.log(`✅ Optimized ${files.length} assets`);
    } catch (error) {
      console.error('❌ Asset optimization failed:', error);
      throw error;
    }
  }

  // Generate responsive image HTML
  static generateResponsiveImageHtml(
    imagePath: string, 
    alt: string, 
    className?: string
  ): string {
    const baseName = path.basename(imagePath, path.extname(imagePath));
    const baseUrl = this.config.baseUrl;
    
    const sizes = [480, 768, 1024, 1920];
    const srcSet = sizes
      .map(size => `${baseUrl}/assets/optimized/${baseName}-${size}w.jpg ${size}w`)
      .join(', ');
    
    return `
      <picture>
        <source 
          srcset="${baseUrl}/assets/optimized/${baseName}.avif" 
          type="image/avif"
        />
        <source 
          srcset="${baseUrl}/assets/optimized/${baseName}.webp" 
          type="image/webp"
        />
        <img 
          src="${this.getAssetUrl(imagePath)}"
          srcset="${srcSet}"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          alt="${alt}"
          ${className ? `class="${className}"` : ''}
          loading="lazy"
        />
      </picture>
    `.trim();
  }

  // Get cache headers for different asset types
  static getCacheHeaders(filePath: string): Record<string, string> {
    const ext = path.extname(filePath).toLowerCase();
    const headers: Record<string, string> = {};
    
    // Determine cache duration based on file type
    let maxAge = 3600; // 1 hour default
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
      maxAge = this.config.cacheDuration.images;
    } else if (['.js', '.mjs'].includes(ext)) {
      maxAge = this.config.cacheDuration.scripts;
    } else if (['.css'].includes(ext)) {
      maxAge = this.config.cacheDuration.styles;
    } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
      maxAge = this.config.cacheDuration.fonts;
    }
    
    headers['Cache-Control'] = `public, max-age=${maxAge}, immutable`;
    headers['Expires'] = new Date(Date.now() + maxAge * 1000).toUTCString();
    
    // Add CORS headers for assets
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS';
    
    // Add content type
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject'
    };
    
    if (mimeTypes[ext]) {
      headers['Content-Type'] = mimeTypes[ext];
    }
    
    return headers;
  }

  // Purge CDN cache for specific assets
  static async purgeCacheForAsset(assetPath: string): Promise<boolean> {
    try {
      // Implementation would depend on your CDN provider
      // This is a generic example that could be adapted for CloudFlare, AWS CloudFront, etc.
      
      console.log(`🗑️ Purging CDN cache for asset: ${assetPath}`);
      
      // Example: CloudFlare cache purge
      if (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID) {
        const url = `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`;
        const assetUrl = this.getAssetUrl(assetPath);
        
        // Note: In a real implementation, you'd use fetch or axios here
        console.log(`Would purge: ${assetUrl}`);\n        
        return true;
      }
      
      // Fallback: clear local cache
      await this.clearLocalCache(assetPath);
      return true;
    } catch (error) {
      console.error('CDN cache purge failed:', error);
      return false;
    }
  }

  // Asset manifest management
  private static async loadAssetManifest(): Promise<void> {
    try {
      const manifestPath = path.join(this.config.assetsPath, 'manifest.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);
      
      Object.entries(manifest).forEach(([key, value]) => {
        this.assetManifest.set(key, value as string);
      });
      
      console.log(`📋 Loaded asset manifest with ${this.assetManifest.size} entries`);
    } catch (error) {
      console.log('📋 No existing asset manifest found, creating new one');
    }
  }

  private static async saveAssetManifest(): Promise<void> {
    try {
      const manifestPath = path.join(this.config.assetsPath, 'manifest.json');
      const manifest = Object.fromEntries(this.assetManifest);
      
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      console.log('📋 Asset manifest saved successfully');
    } catch (error) {
      console.error('❌ Failed to save asset manifest:', error);
    }
  }

  // Utility functions
  private static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private static async findFiles(directory: string, extensions: string[]): Promise<string[]> {
    const files: string[] = [];
    
    const scan = async (dir: string): Promise<void> => {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          await scan(fullPath);
        } else if (extensions.includes(path.extname(item).toLowerCase())) {
          files.push(fullPath);
        }
      }
    };
    
    await scan(directory);
    return files;
  }

  private static async clearLocalCache(assetPath: string): Promise<void> {
    // Implementation for clearing local cache
    console.log(`🗑️ Clearing local cache for: ${assetPath}`);
  }

  // Asset delivery with proper headers
  static getAssetHeaders(assetPath: string, req: any): Record<string, string> {
    const headers = this.getCacheHeaders(assetPath);
    
    // Add compression headers
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.includes('br')) {
      headers['Content-Encoding'] = 'br';
    } else if (acceptEncoding.includes('gzip')) {
      headers['Content-Encoding'] = 'gzip';
    }
    
    // Add ETag for cache validation
    const etag = crypto.createHash('md5').update(assetPath).digest('hex');
    headers['ETag'] = `"${etag}"`;
    
    // Add Last-Modified
    headers['Last-Modified'] = new Date().toUTCString();
    
    return headers;
  }

  // Generate optimized asset variants
  static async generateAssetVariants(assetPath: string): Promise<{
    original: string;
    webp?: string;
    avif?: string;
    sizes: string[];
  }> {
    const outputDir = path.join(this.config.assetsPath, 'optimized');
    const optimizedPaths = await this.optimizeImage(assetPath, outputDir);
    
    const variants = {
      original: assetPath,
      sizes: optimizedPaths.filter(p => p.includes('-') && p.includes('w.'))
    };
    
    // Find WebP variant
    const webpPath = optimizedPaths.find(p => p.endsWith('.webp'));
    if (webpPath) {
      variants['webp'] = webpPath;
    }
    
    // Find AVIF variant
    const avifPath = optimizedPaths.find(p => p.endsWith('.avif'));
    if (avifPath) {
      variants['avif'] = avifPath;
    }
    
    return variants;
  }

  // Asset preloading hints
  static generatePreloadHints(criticalAssets: string[]): string {
    return criticalAssets
      .map(asset => {
        const url = this.getAssetUrl(asset);
        const ext = path.extname(asset).toLowerCase();
        
        let asType = 'fetch';
        if (['.css'].includes(ext)) asType = 'style';
        else if (['.js', '.mjs'].includes(ext)) asType = 'script';
        else if (['.woff', '.woff2'].includes(ext)) asType = 'font';
        else if (['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) asType = 'image';
        
        const crossorigin = ['.woff', '.woff2'].includes(ext) ? ' crossorigin' : '';
        
        return `<link rel="preload" href="${url}" as="${asType}"${crossorigin}>`;
      })
      .join('\\n');
  }

  // Service worker cache strategy
  static generateServiceWorkerCacheStrategy(): string {
    return `
// CDN Asset Caching Strategy for Service Worker
const CACHE_NAME = 'pixelcyberzone-assets-v1';
const CDN_BASE_URL = '${this.config.baseUrl}';

// Cache strategy for different asset types
const cacheStrategies = {
  images: 'CacheFirst',
  scripts: 'StaleWhileRevalidate',
  styles: 'StaleWhileRevalidate',
  fonts: 'CacheFirst'
};

// Assets to precache
const PRECACHE_ASSETS = [
  '/assets/css/main.css',
  '/assets/js/main.js',
  '/assets/images/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle CDN assets
  if (url.origin === CDN_BASE_URL) {
    const ext = url.pathname.split('.').pop();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'].includes(ext)) {
      event.respondWith(cacheFirst(event.request));
    } else if (['js', 'css'].includes(ext)) {
      event.respondWith(staleWhileRevalidate(event.request));
    } else if (['woff', 'woff2', 'ttf'].includes(ext)) {
      event.respondWith(cacheFirst(event.request));
    }
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  return cached || fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  });
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  });
  return cached || fetchPromise;
}
    `.trim();
  }

  // Get asset manifest for client-side usage
  static getAssetManifest(): Record<string, string> {
    return Object.fromEntries(this.assetManifest);
  }

  // Asset optimization status
  static async getOptimizationStatus(): Promise<any> {
    try {
      const assetsDir = this.config.assetsPath;
      const optimizedDir = path.join(assetsDir, 'optimized');
      
      const originalFiles = await this.findFiles(assetsDir, ['.jpg', '.jpeg', '.png', '.gif']);
      const optimizedFiles = await this.findFiles(optimizedDir, ['.jpg', '.jpeg', '.png', '.webp', '.avif']);
      
      return {
        originalAssets: originalFiles.length,
        optimizedAssets: optimizedFiles.length,
        compressionRatio: optimizedFiles.length > 0 ? (optimizedFiles.length / originalFiles.length) : 0,
        manifestEntries: this.assetManifest.size,
        lastOptimized: new Date().toISOString()
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default CDNService;
