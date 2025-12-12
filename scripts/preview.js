const { build, distDir } = require('./build');
const { createServer } = require('./server');

async function start() {
  await build();
  createServer(distDir, 4174);
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
