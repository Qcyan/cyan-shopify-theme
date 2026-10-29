/**
 * 将 src 中分层的 Liquid / CSS 扁平化输出到 theme/（Shopify 规范目录）。
 *
 * 约定:
 *   src/sections/<domain>/<name>/<name>.liquid  → theme/sections/<name>.liquid
 *   src/sections/<domain>/<name>/<name>.css     → theme/assets/section-<name>.css
 *   src/snippets/<domain>/<name>/<name>.liquid  → theme/snippets/<name>.liquid
 *   src/snippets/<domain>/<name>/<name>.css     → theme/assets/snippet-<name>.css
 *
 * 同名冲突时后者覆盖前者并打印警告。
 */

import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = join(root, 'src');
const themeRoot = join(root, 'theme');
const manifestPath = join(themeRoot, '.src-manifest.json');

const MANAGED_MARKER = '/* built-from-src: do not edit in theme/ — edit under src/ */\n';

function existsDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

function walk(dir, out = []) {
  if (!existsDir(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function fileExists(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

function collectUnits(kind) {
  const base = join(srcRoot, kind);
  return walk(base)
    .filter((f) => f.endsWith('.liquid'))
    .map((liquidPath) => {
      const name = basename(liquidPath, '.liquid');
      const dir = dirname(liquidPath);
      const cssCandidate = join(dir, `${name}.css`);
      return {
        kind,
        name,
        liquidPath,
        cssPath: fileExists(cssCandidate) ? cssCandidate : null,
        rel: relative(srcRoot, liquidPath).replace(/\\/g, '/'),
      };
    });
}

function readPrevManifest() {
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    return { items: [] };
  }
}

function main() {
  const units = [...collectUnits('sections'), ...collectUnits('snippets')];
  const seen = new Map();
  const report = [];
  const manifestItems = [];

  ensureDir(join(themeRoot, 'sections'));
  ensureDir(join(themeRoot, 'snippets'));
  ensureDir(join(themeRoot, 'assets'));

  for (const item of readPrevManifest().items || []) {
    rmSync(join(themeRoot, item.liquidOut), { force: true });
    if (item.cssOut) rmSync(join(themeRoot, item.cssOut), { force: true });
  }

  for (const unit of units) {
    if (seen.has(unit.name)) {
      console.warn(
        `[build-liquid] 命名冲突: "${unit.name}"\n  先前: ${seen.get(unit.name)}\n  覆盖: ${unit.rel}`
      );
    }
    seen.set(unit.name, unit.rel);

    const liquidOutRel = `${unit.kind}/${unit.name}.liquid`;
    const liquidOut = join(themeRoot, liquidOutRel);
    ensureDir(dirname(liquidOut));
    cpSync(unit.liquidPath, liquidOut);

    let cssOutRel = null;
    if (unit.cssPath) {
      const prefix = unit.kind === 'sections' ? 'section' : 'snippet';
      cssOutRel = `assets/${prefix}-${unit.name}.css`;
      writeFileSync(
        join(themeRoot, cssOutRel),
        `${MANAGED_MARKER}${readFileSync(unit.cssPath, 'utf8')}`,
        'utf8'
      );
    }

    manifestItems.push({
      name: unit.name,
      kind: unit.kind,
      src: unit.rel,
      liquidOut: liquidOutRel,
      cssOut: cssOutRel,
    });

    report.push(
      `  ${unit.rel} → ${liquidOutRel}` + (cssOutRel ? ` + ${cssOutRel}` : '')
    );
  }

  writeFileSync(
    manifestPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), items: manifestItems }, null, 2),
    'utf8'
  );

  console.log(`[build-liquid] 已同步 ${manifestItems.length} 个单元到 theme/`);
  for (const line of report) console.log(line);
}

main();
