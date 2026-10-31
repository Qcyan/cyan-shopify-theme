/**
 * 为 Shopify CLI / Node 子进程注入本机系统代理，并加载项目根 .env。
 * 默认代理 127.0.0.1:7897，可用 QS_PROXY / HTTPS_PROXY 覆盖。
 *
 * Node 24 的 fetch 需 NODE_USE_ENV_PROXY=1 才会走 HTTPS_PROXY（Shopify CLI OAuth 依赖此）。
 *
 * .env 可写（勿提交）：
 *   SHOPIFY_FLAG_STORE_PASSWORD=店铺前台密码
 *   SHOPIFY_FLAG_STORE=xxx.myshopify.com
 *
 * 注意：--password 是 Theme Access token；前台锁店密码必须是 STORE_PASSWORD。
 */
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

function loadDotEnv(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, 'utf8').split(/\r\n|\n|\r/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i <= 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const fileEnv = loadDotEnv(envPath);

const proxy =
  process.env.QS_PROXY ||
  process.env.HTTPS_PROXY ||
  process.env.HTTP_PROXY ||
  fileEnv.QS_PROXY ||
  fileEnv.HTTPS_PROXY ||
  'http://127.0.0.1:7897';

function canListen(port) {
  return new Promise((resolveListen) => {
    const server = createServer();
    server.unref();
    server.once('error', () => resolveListen(false));
    server.once('listening', () => {
      server.close(() => resolveListen(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** 查出占用端口的 PID（本机预览端口） */
function pidsOnPort(port) {
  const pids = new Set();
  if (process.platform === 'win32') {
    try {
      const out = execFileSync('netstat', ['-ano', '-p', 'tcp'], {
        encoding: 'utf8',
        windowsHide: true,
      });
      const re = new RegExp(`(?:0\\.0\\.0\\.0|127\\.0\\.0\\.1|\\[::1?\\]|\\*):${port}\\s+.*?LISTENING\\s+(\\d+)`, 'gi');
      let m;
      while ((m = re.exec(out))) {
        const pid = Number(m[1]);
        if (pid > 0) pids.add(pid);
      }
    } catch {
      /* ignore */
    }
  } else {
    try {
      const out = execFileSync('lsof', ['-ti', `tcp:${port}`, `-sTCP:LISTEN`], {
        encoding: 'utf8',
      });
      for (const line of out.split(/\r?\n/)) {
        const pid = Number(line.trim());
        if (pid > 0) pids.add(pid);
      }
    } catch {
      /* ignore */
    }
  }
  return [...pids];
}

function killPid(pid) {
  if (pid === process.pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
  } else {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      /* ignore */
    }
  }
}

/**
 * 优先占用 preferred：若被占则先杀掉旧进程再绑回原端口；
 * 杀不掉才回退到下一个空闲端口。
 */
async function ensureThemePort(preferred = 9292, attempts = 30) {
  if (await canListen(preferred)) return preferred;

  const pids = pidsOnPort(preferred);
  if (pids.length) {
    console.info(`[port] ${preferred} 被占用 (PID ${pids.join(', ')})，正在关闭旧进程…`);
    for (const pid of pids) killPid(pid);
    for (let i = 0; i < 10; i++) {
      await sleep(200);
      if (await canListen(preferred)) {
        console.info(`[port] 已释放，继续使用 ${preferred}`);
        return preferred;
      }
    }
  }

  for (let port = preferred + 1; port < preferred + attempts; port++) {
    if (await canListen(port)) {
      console.info(`[port] 未能释放 ${preferred}，改用 ${port}`);
      return port;
    }
  }
  throw new Error(`找不到可用端口（${preferred}–${preferred + attempts - 1}）`);
}

function hasFlag(argv, names) {
  return argv.some((a) => names.includes(a) || names.some((n) => a.startsWith(`${n}=`)));
}

function isThemeDev(argv) {
  const joined = argv.join(' ');
  return /\btheme\b/.test(joined) && /\bdev\b/.test(joined);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('用法: node scripts/run-with-proxy.mjs <command> [args...]');
  process.exit(1);
}

const env = {
  ...process.env,
  ...fileEnv,
  HTTP_PROXY: proxy,
  HTTPS_PROXY: proxy,
  http_proxy: proxy,
  https_proxy: proxy,
  NODE_USE_ENV_PROXY: process.env.NODE_USE_ENV_PROXY || fileEnv.NODE_USE_ENV_PROXY || '1',
  NO_PROXY: process.env.NO_PROXY || fileEnv.NO_PROXY || 'localhost,127.0.0.1',
  no_proxy: process.env.no_proxy || fileEnv.no_proxy || 'localhost,127.0.0.1',
};

async function main() {
  const childArgs = args.slice(1).map(String);

  if (
    isThemeDev(args) &&
    !hasFlag(childArgs, ['--port']) &&
    !env.SHOPIFY_FLAG_PORT
  ) {
    const preferred = Number(process.env.QS_THEME_PORT || fileEnv.QS_THEME_PORT || 9292);
    const port = await ensureThemePort(Number.isFinite(preferred) ? preferred : 9292);
    childArgs.push('--port', String(port));
    console.info(`[port] theme preview → http://127.0.0.1:${port}`);
    env.SHOPIFY_FLAG_PORT = String(port);
  }

  console.info(
    `[proxy] HTTPS_PROXY=${proxy} NODE_USE_ENV_PROXY=${env.NODE_USE_ENV_PROXY}` +
      (env.SHOPIFY_FLAG_STORE_PASSWORD || env.SHOPIFY_FLAG_PASSWORD
        ? ' (store password: set)'
        : ' (store password: missing)'),
  );

  const child = spawn(args[0], childArgs, {
    env,
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 1);
  });
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
