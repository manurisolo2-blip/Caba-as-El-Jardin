const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const ROOT_DIR = path.resolve(__dirname);

/* Tipos MIME permitidos (lista blanca estricta) */
const ALLOWED_MIMES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

/* Extensiones y patrones prohibidos (código interno, base de datos, configuraciones) */
const FORBIDDEN_EXTENSIONS = new Set([
  '.env', '.sql', '.md', '.json', '.ts', '.tsx', '.yml', '.yaml',
  '.lock', '.log', '.tmp', '.bak', '.map', '.sh', '.bat', '.cmd'
]);

/* Cabeceras de seguridad globales */
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com; connect-src 'self' https://*.supabase.co;"
};

/* Rate limiting liviano en memoria */
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 200; // 200 peticiones por minuto por IP
const ipRequests = new Map();

// Limpieza periódica cada 3 minutos
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequests.entries()) {
    if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
      ipRequests.delete(ip);
    }
  }
}, 3 * 60 * 1000).unref();

function verificarRateLimit(ip) {
  const now = Date.now();
  let record = ipRequests.get(ip);
  if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    ipRequests.set(ip, { count: 1, startTime: now });
    return true;
  }
  record.count += 1;
  return record.count <= MAX_REQUESTS_PER_WINDOW;
}

function responderError(res, statusCode, mensaje) {
  res.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end(mensaje);
}

function resolverRutaSegura(urlPath) {
  // Limpieza inicial
  let clean = urlPath.split('?')[0].split('#')[0];
  if (clean === '/' || clean === '') clean = '/index.html';

  // Detección de segmentos ocultos (.git, .env, .vscode, etc.)
  const partes = clean.split(/[/\\]+/).filter(Boolean);
  for (const parte of partes) {
    if (parte.startsWith('.')) {
      return { error: 403, mensaje: '403 Acceso denegado' };
    }
  }

  const candidate = path.resolve(ROOT_DIR, '.' + clean);

  // Verificación de Directory Traversal
  const rel = path.relative(ROOT_DIR, candidate);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    return { error: 403, mensaje: '403 Acceso denegado' };
  }

  let finalPath = candidate;
  try {
    if (!fs.existsSync(candidate)) {
      return { error: 404, mensaje: '404 No encontrado' };
    }
    const stat = fs.statSync(candidate);
    if (stat.isDirectory()) {
      finalPath = path.join(candidate, 'index.html');
      if (!fs.existsSync(finalPath)) {
        return { error: 404, mensaje: '404 No encontrado' };
      }
    }
  } catch (_) {
    return { error: 500, mensaje: '500 Error interno' };
  }

  // Verificación de extensión en lista blanca
  const ext = path.extname(finalPath).toLowerCase();
  if (FORBIDDEN_EXTENSIONS.has(ext) || !ALLOWED_MIMES[ext]) {
    return { error: 403, mensaje: '403 Tipo de archivo no permitido' };
  }

  return { path: finalPath, ext, mime: ALLOWED_MIMES[ext] };
}

const server = http.createServer((req, res) => {
  // 1. Manejo seguro de Rate Limiting por IP
  const clientIp = req.socket.remoteAddress || 'unknown';
  if (!verificarRateLimit(clientIp)) {
    return responderError(res, 429, '429 Demasiadas peticiones. Intente nuevamente en unos instantes.');
  }

  // 2. Validación de método HTTP (solo GET y HEAD)
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return responderError(res, 405, '405 Método no permitido');
  }

  // 3. Validación y decodificación segura de URL (anti-crasheo por URI malformada)
  let safeUrl = '';
  try {
    if ((req.url || '').length > 2048) {
      return responderError(res, 414, '414 URI Demasiado Larga');
    }
    safeUrl = decodeURIComponent(req.url || '/');
  } catch (_) {
    return responderError(res, 400, '400 Solicitud incorrecta (URI inválida)');
  }

  // 4. Resolución y validación estricta de ruta en disco
  const resultado = resolverRutaSegura(safeUrl);
  if (resultado.error) {
    return responderError(res, resultado.error, resultado.mensaje);
  }

  // 5. Lectura y entrega segura del archivo
  fs.readFile(resultado.path, (err, data) => {
    if (err) {
      return responderError(res, 500, '500 Error al leer el recurso');
    }

    const headers = {
      ...SECURITY_HEADERS,
      'Content-Type': resultado.mime,
      'Cache-Control': resultado.ext === '.html'
        ? 'no-cache, must-revalidate'
        : 'public, max-age=86400'
    };

    res.writeHead(200, headers);
    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end(data);
    }
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Servidor local blindado activo en: http://localhost:${PORT}/`);
  });
}

module.exports = server;
