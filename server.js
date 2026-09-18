const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

function encontrarArchivo(urlPath) {
  let cleanPath = urlPath.replace(/^\/+/, '');
  if (!cleanPath) cleanPath = 'index.html';

  const roots = [
    __dirname,
    process.cwd(),
    path.resolve('.'),
    path.resolve(__dirname, '.')
  ];

  for (const root of roots) {
    const candidate = path.join(root, cleanPath);
    try {
      if (fs.existsSync(candidate)) {
        const stats = fs.statSync(candidate);
        if (stats.isDirectory()) {
          const indexCandidate = path.join(candidate, 'index.html');
          if (fs.existsSync(indexCandidate)) return indexCandidate;
        } else {
          return candidate;
        }
      }
    } catch (_) {}
  }
  return null;
}

const server = http.createServer((req, res) => {
  let safeUrl = decodeURIComponent((req.url || '/').split('?')[0]);
  if (safeUrl === '/' || safeUrl === '') safeUrl = '/index.html';

  const targetFile = encontrarArchivo(safeUrl);

  if (!targetFile) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(`404 No encontrado: ${safeUrl}`);
  }

  fs.readFile(targetFile, (readErr, data) => {
    if (readErr) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(`Error al leer archivo: ${safeUrl}`);
    }

    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache, must-revalidate' : 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Servidor local activo en: http://localhost:${PORT}/`);
  });
}

module.exports = server;
