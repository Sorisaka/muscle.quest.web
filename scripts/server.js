const fs = require('fs');
const path = require('path');
const http = require('http');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};

function createServer(rootDir, port = 4173) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const safePath = path.normalize(urlPath).replace(/^\\|^\//, '');
    const requestedPath = path.join(rootDir, safePath || 'index.html');

    fs.stat(requestedPath, (err, stats) => {
      const fallbackPath = path.join(rootDir, 'index.html');
      const finalPath = !err && stats.isFile() ? requestedPath : fallbackPath;
      const ext = path.extname(finalPath);
      const contentType = mimeTypes[ext] || 'text/plain; charset=utf-8';

      fs.createReadStream(finalPath)
        .on('error', (error) => {
          res.writeHead(500);
          res.end(`Server error: ${error.message}`);
        })
        .once('open', () => {
          res.writeHead(200, { 'Content-Type': contentType });
        })
        .pipe(res);
    });
  });

  server.listen(port, () => {
    console.log(`Serving ${rootDir} at http://localhost:${port}`);
  });

  return server;
}

module.exports = { createServer };
