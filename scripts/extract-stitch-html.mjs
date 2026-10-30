import { readFileSync, writeFileSync } from 'node:fs';

function extract(src, dest) {
  const raw = readFileSync(src, 'utf8');
  let html = raw;
  try {
    const j = JSON.parse(raw);
    html = j.html || j.result?.html || raw;
  } catch {
    /* raw html */
  }
  if (typeof html !== 'string') html = String(html);
  writeFileSync(dest, html);
  console.log(dest, html.length);
}

extract(
  'C:/Users/Administrator/.cursor/projects/f-qiushiqing-QS-shopify-dev-theme/agent-tools/8ee9daff-d338-49cb-ac68-196c7746c943.txt',
  'stitch/desktop-collection.html'
);
extract(
  'C:/Users/Administrator/.cursor/projects/f-qiushiqing-QS-shopify-dev-theme/agent-tools/cc6a4a33-c6fe-4dc5-938a-d1e74090232b.txt',
  'stitch/desktop-pdp.html'
);
extract(
  'C:/Users/Administrator/.cursor/projects/f-qiushiqing-QS-shopify-dev-theme/agent-tools/6603b955-3458-458e-8a03-66fbd7625fac.txt',
  'stitch/desktop-cart.html'
);
