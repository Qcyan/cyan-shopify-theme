/**
 * 监听 src/sections 与 src/snippets，变更后重新执行 build-liquid。
 */

import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const targets = [join(root, 'src', 'sections'), join(root, 'src', 'snippets')];

let timer = null;

function runBuild() {
  const child = spawn(process.execPath, [join(root, 'scripts', 'build-liquid.mjs')], {
    stdio: 'inherit',
  });
  child.on('exit', (code) => {
    if (code !== 0) console.error(`[watch-liquid] build 退出码 ${code}`);
  });
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(runBuild, 120);
}

runBuild();

for (const dir of targets) {
  try {
    watch(dir, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      if (!/\.(liquid|css)$/i.test(filename)) return;
      console.log(`[watch-liquid] 变更: ${filename}`);
      schedule();
    });
    console.log(`[watch-liquid] 监听 ${dir}`);
  } catch (err) {
    console.warn(`[watch-liquid] 无法监听 ${dir}:`, err.message);
  }
}
