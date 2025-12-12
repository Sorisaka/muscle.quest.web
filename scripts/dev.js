const fs = require('fs');
const path = require('path');
const { build, distDir } = require('./build');
const { createServer } = require('./server');

const srcDir = path.resolve(__dirname, '..', 'src');
let isBuilding = false;
let rebuildQueued = false;

async function runBuild() {
  if (isBuilding) {
    rebuildQueued = true;
    return;
  }

  isBuilding = true;
  await build().catch((error) => console.error(error));
  isBuilding = false;

  if (rebuildQueued) {
    rebuildQueued = false;
    runBuild();
  }
}

function watchSource() {
  fs.watch(srcDir, { recursive: true }, () => {
    runBuild();
  });
  console.log('Watching src/ for changes...');
}

async function start() {
  await runBuild();
  createServer(distDir, 4173);
  watchSource();
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
