const fs = require('fs/promises');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const distDir = path.join(projectRoot, 'dist');

async function clean() {
  await fs.rm(distDir, { recursive: true, force: true });
}

async function ensureDist() {
  await fs.mkdir(distDir, { recursive: true });
}

async function copyAsset(fileName) {
  const from = path.join(srcDir, fileName);
  const to = path.join(distDir, fileName);
  await fs.copyFile(from, to);
}

async function build() {
  await clean();
  await ensureDist();
  await Promise.all(['index.html', 'style.css', 'app.js'].map(copyAsset));
  console.log('Build complete: dist/ contains index.html and bundled app.js');
}

if (require.main === module) {
  build().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { build, distDir };
