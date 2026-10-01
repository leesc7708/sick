// 안내서 HTML → PDF (A4 가로, 배경색 포함). Chrome DevTools Protocol 직접 호출.
// Chrome CLI의 --print-to-pdf 는 배경색을 빼고 출력하므로 printBackground:true 가 필요하다.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DIR = __dirname;
const SRC = path.join(DIR, '라이프라인_시스템소개_안내서.html');
const OUT = path.join(DIR, '라이프라인_시스템소개_안내서.pdf');
const PORT = 9334;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`,
  '--no-first-run', '--user-data-dir=' + path.join(process.env.TEMP, 'cdp-pdf'),
  'about:blank',
], { stdio: 'ignore' });

(async () => {
  let ver;
  for (let i = 0; i < 40; i++) {
    try { ver = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; }
    catch { await sleep(250); }
  }
  if (!ver) throw new Error('Chrome CDP 연결 실패');

  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((res) => { const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method, params, sessionId })); });

  const { result: { targetInfos } } = await send('Target.getTargets');
  const page = targetInfos.find((t) => t.type === 'page');
  const { result: { sessionId } } = await send('Target.attachToTarget', { targetId: page.targetId, flatten: true });

  await send('Page.enable', {}, sessionId);
  const url = 'file:///' + SRC.replace(/\\/g, '/').replace(/[^\x00-\x7F]/g, (c) => encodeURIComponent(c));
  await send('Page.navigate', { url }, sessionId);
  await sleep(4500); // 웹폰트(IBM Plex) 로드 대기

  // 폰트가 실제로 적용됐는지 확인 — 폴백으로 조용히 떨어지면 레이아웃이 달라진다
  const check = await send('Runtime.evaluate', {
    expression: `JSON.stringify({ fonts: document.fonts.status, sheets: document.querySelectorAll('.sheet').length })`,
    returnByValue: true,
  }, sessionId);
  console.log('로드 상태:', check.result.result.value);

  const { result } = await send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
    landscape: true,
    paperWidth: 11.69, paperHeight: 8.27,
  }, sessionId);

  fs.writeFileSync(OUT, Buffer.from(result.data, 'base64'));
  console.log(`생성: ${OUT} (${fs.statSync(OUT).size.toLocaleString()} bytes)`);

  ws.close();
  chrome.kill();
  process.exit(0);
})().catch((e) => { console.error(e); chrome.kill(); process.exit(1); });
