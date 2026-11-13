// Screenshots of the makie plate through headless Chrome over the DevTools protocol; no Playwright needed.
// Usage: node scripts/plate-shot.mjs <outDir> <job> [job…]   (the dev server must be on 127.0.0.1:3000)
// job = name:steps:theme:WxH:zoom:fx,fy   steps: signed cabinet steps from Minami; theme: night|day, plus "-still"
// to press pause first; zoom 1..3; fx,fy: where the light rests, as fractions of the canvas. See docs/MAKIE_PLATE_HANDOFF.md §7.
import {spawn} from 'node:child_process';
import {writeFileSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const PORT = 9377, CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const [outDir, ...jobs] = process.argv.slice(2);
mkdirSync(outDir, {recursive: true});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const alive = async () => { try { return (await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok; } catch { return false; } };
if (!await alive()) {
  spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${fileURLToPath(new URL('../node_modules/.cache/chrome-profile', import.meta.url))}`, '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--window-size=1440,900', 'about:blank'], {detached: true, stdio: 'ignore'}).unref();
  for (let i = 0; i < 40 && !await alive(); i++) await sleep(250);
}
const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {method: 'PUT'})).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let seq = 0; const pending = new Map(), logs = [];
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) logs.push(m.params.args.map(a => a.value ?? a.description).join(' '));
  if (m.method === 'Runtime.exceptionThrown') logs.push('EXC ' + m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description ?? ''));
});
const send = (method, params = {}) => new Promise(r => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({id, method, params})); });
const evalJs = async expression => (await send('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true})).result?.result?.value;
await send('Runtime.enable'); await send('Page.enable');

for (const job of jobs) {
  const [name, steps, theme, size, zoom, at] = job.split(':'), [w, h] = size.split('x').map(Number), [fx, fy] = at.split(',').map(Number);
  await send('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: w < 700 ? 2 : 1, mobile: false});
  await send('Page.navigate', {url: 'http://127.0.0.1:3000/toji-study/index.html'});
  for (let i = 0; i < 60 && !(await evalJs(`Boolean(document.querySelector('#scene')?.dataset.lift)`)); i++) await sleep(200);
  if (theme.endsWith('still')) { await evalJs(`document.querySelector('#motion').click()`); await sleep(200); }
  if (theme.startsWith('day')) { await evalJs(`document.querySelector('#night').click()`); await sleep(300); }
  for (let i = 0; i < Math.abs(Number(steps)); i++) {
    await evalJs(`document.querySelector('#${Number(steps) < 0 ? 'previous' : 'next'}-cabinet').click()`);
    for (let k = 0; k < 40; k++) { await sleep(150); if (!(await evalJs(`document.querySelector('#next-cabinet').disabled`))) break; }
  }
  await evalJs(`document.querySelector('#scene').scrollIntoView({block:'center'})`);
  await sleep(300);
  const r = await evalJs(`(()=>{const c=document.querySelector('#scene').getBoundingClientRect();return [c.x,c.y,c.width,c.height,scrollX,scrollY];})()`);
  const x = r[0] + r[2] * fx, y = r[1] + r[3] * fy;
  await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: x - 30, y: y - 20});
  await sleep(120);
  await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x, y});
  if (Number(zoom) > 1) { await send('Input.dispatchMouseEvent', {type: 'mouseWheel', x, y, deltaX: 0, deltaY: -Math.log(Number(zoom)) / .01, modifiers: 2}); await sleep(900); }
  await sleep(2800);
  await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: x + 1, y});
  await sleep(400);
  const info = await evalJs(`JSON.stringify(Object.assign({}, document.querySelector('#scene').dataset))`);
  const shot = await send('Page.captureScreenshot', {format: 'png', clip: {x: Math.max(0, r[0] + r[4]), y: Math.max(0, r[1] + r[5]), width: r[2], height: r[3], scale: 1}});
  writeFileSync(join(outDir, `${name}.png`), Buffer.from(shot.result.data, 'base64'));
  console.log(name, info);
}
if (logs.length) console.log('CONSOLE:', [...new Set(logs)].slice(0, 12).join('\n'));
await send('Target.closeTarget', {targetId: target.id}).catch(() => {});
ws.close();
