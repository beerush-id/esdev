const { watch } = require('chokidar');
const { writeFileSync, removeSync, readFileSync } = require('fs-extra');
const { spawn, spawnSync } = require('child_process');
const { join } = require('path');
const glob = require('glob');

const watchScript = process.argv.includes('--watch');
const clean = process.argv.includes('--clean');

if (clean) {
  removeSync(join(process.cwd(), 'dist'));
}

if (watchScript) {
  spawn('tsc', ['-w', '-p', './tsconfig.json'], { stdio: 'inherit', shell: true });
  spawn('tsc', ['-w', '-p', './tsconfig-cjs.json'], { stdio: 'inherit', shell: true });

  watch('./dist').on('all', (event, file) => {
    if (event === 'add' && file.includes('cjs') && file.endsWith('.js')) {
      rename(join(process.cwd(), file), 'cjs');
    }
  });
} else {
  spawnSync('tsc', ['-p', './tsconfig.json'], { stdio: 'inherit', shell: true });
  spawnSync('tsc', ['-p', './tsconfig-cjs.json'], { stdio: 'inherit', shell: true });

  const files = glob.sync('./dist/cjs/**/*.js');

  for (const file of files) {
    rename(file, 'cjs');
  }
}

function rename(file, ext = 'cjs') {
  const content = readFileSync(file, 'utf-8');
  const path = file.replace('.js', `.${ext}`);
  const text = content.replace(/\.js/g, `.${ext}`);

  writeFileSync(path, text, 'utf-8');
  removeSync(file);
}
