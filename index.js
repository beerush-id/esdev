const { watch } = require('chokidar');
const { writeFileSync, removeSync, readFileSync, ensureDirSync } = require('fs-extra');
const { spawn, spawnSync } = require('child_process');
const { join } = require('path');
const glob = require('glob');

const watchScript = process.argv.includes('--watch');
const clean = process.argv.includes('--clean');

const cwd = process.cwd();
const esm = require(join(cwd, 'tsconfig.json'));
const cjs = require(join(cwd, 'tsconfig-cjs.json'));

const esmOutDir = join(cwd, esm.compilerOptions?.outDir || 'dist/esm');
const cjsOutDir = join(cwd, cjs.compilerOptions?.outDir || 'dist/cjs');

if (esmOutDir) {
  if (clean) {
    removeSync(esmOutDir);
  }

  ensureDirSync(esmOutDir);
}

if (cjsOutDir) {
  if (clean) {
    removeSync(cjsOutDir);
  }

  ensureDirSync(cjsOutDir);
}

const changeList = [];

if (watchScript) {
  watch(cjsOutDir).on('all', (event, file) => {
    if (event === 'add' && file.endsWith('.js')) {
      rename(file, 'cjs');
    }
  });

  watch(esmOutDir).on('all', (event, file) => {
    if (file.endsWith('.cjs')) {
      if (changeList.includes(file)) {
        changeList.splice(changeList.indexOf(file), 1);
      } else {
        changeList.push(file);
        cleanup(file);
      }
    }
  });

  spawn('tsc', [ '-w', '-p ./tsconfig.json' ], { stdio: 'inherit', shell: true });
  spawn('tsc', [ '-w', '-p ./tsconfig-cjs.json' ], { stdio: 'inherit', shell: true });
} else {
  spawnSync('tsc', [ '-p ./tsconfig.json' ], { stdio: 'inherit', shell: true });
  spawnSync('tsc', [ '-p ./tsconfig-cjs.json' ], { stdio: 'inherit', shell: true });

  const files = glob.sync(`${cjsOutDir}/**/*.js`);

  for (const file of files) {
    rename(file, 'cjs');
  }

  const esFiles = glob.sync(`${esmOutDir}/**/*.cjs`);

  for (const file of esFiles) {
    cleanup(file);
  }
}

function rename(file, ext = 'cjs') {
  const content = readFileSync(file, 'utf-8');
  const path = file.replace('.js', `.${ext}`);
  const text = content.replace(/\.js/g, `.${ext}`);

  writeFileSync(path, text, 'utf-8');
  removeSync(file);
}

function cleanup(file) {
  const content = readFileSync(file, 'utf-8');
  const text = content.replaceAll('export {};', '');
  writeFileSync(file, text, 'utf-8');
}
