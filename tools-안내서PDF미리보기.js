// 생성된 PDF를 Chrome PDF 뷰어로 열어 지정 페이지를 PNG로 캡처한다.
//   node tools-안내서PDF미리보기.js 9 12
// 왜 필요한가: pdftotext는 다단 레이아웃에서 두 단의 글자를 뒤섞어 내보낸다
// ("사후 파악에서…"가 옆 단 글자와 교차로 끼어 들어온다). 그래서 문자열 검사만으로는
// 잘림을 오탐·누락 양쪽으로 틀리게 본다. 눈으로 보는 것이 유일하게 확실한 확인이다.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PDF = path.join(__dirname, '라이프라인_시스템소개_안내서.pdf');
const PORT = 9341;
const PAGES = process.argv.slice(2).map(Number).filter(Boolean);
if (!PAGES.length) { console.error('쪽 번호를 인자로 주세요. 예: node tools-안내서PDF미리보기.js 9 12'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`,
  '--no-first-run', '--hide-scrollbars', '--user-data-dir=' + path.join(process.env.TEMP, 'cdp-pdfshot'),
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
  let id = 0; const pend = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
  const send = (method, params = {}, s) =>
    new Promise((res) => { const n = ++id; pend.set(n, res); ws.send(JSON.stringify({ id: n, method, params, sessionId: s })); });

  const { result: { targetInfos } } = await send('Target.getTargets');
  const page = targetInfos.find((t) => t.type === 'page');
  const { result: { sessionId: S } } = await send('Target.attachToTarget', { targetId: page.targetId, flatten: true });

  await send('Page.enable', {}, S);
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 860, deviceScaleFactor: 1.4, mobile: false }, S);
  const url = 'file:///' + PDF.replace(/\\/g, '/').replace(/[^\x00-\x7F]/g, (c) => encodeURIComponent(c));

  for (const n of PAGES) {
    // 해시만 바꾸면 뷰어가 안 움직여서 매번 다시 연다
    await send('Page.navigate', { url: `${url}#page=${n}` }, S);
    await send('Page.reload', {}, S);
    await sleep(3000);
    const shot = await send('Page.captureScreenshot', { format: 'png' }, S);
    const f = path.join(__dirname, `.pdfpage-${String(n).padStart(2, '0')}.png`);
    fs.writeFileSync(f, Buffer.from(shot.result.data, 'base64'));
    console.log('캡처:', path.basename(f));
  }

  ws.close(); chrome.kill(); process.exit(0);
})().catch((e) => { console.error(e); chrome.kill(); process.exit(1); });
