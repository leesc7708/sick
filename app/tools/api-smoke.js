// ─────────────────────────────────────────────────────────────
// 라이프라인 API 스모크 테스트 — 배포 전후 / 장애 의심 시 1분 검증
//
//   실행: node tools/api-smoke.js                    (app/ 에서)
//   옵션: --base <url>   기본 https://wheresick-5617a.web.app
//         --direct       Hosting rewrite 대신 Cloud Functions URL을 직접 때림
//                        (503 원인이 Hosting인지 함수인지 가르기)
//         --sido <시도>  기본 서울특별시
//         --no-ai        dept-consult(유료 Claude 호출) 건너뜀
//         --key <path>   결제상태 확인용 서비스계정 키
//                        (기본: ~/.secrets/wheresick-5617a-adminsdk.json)
//
// 왜 있나 — 2026-08-15 결제(Blaze) 계정이 끊겨 /api/egen-* 7종이 전부 503이 됐는데,
// 앱은 실패를 "조건에 맞는 곳이 없어요"로 표시해 11일간 아무도 몰랐다.
// 이 스크립트는 그 상황에서 딱 1초 만에 빨간 줄을 띄운다.
// 종료코드: 정상 0 / 하나라도 실패 1  → CI·cron에 그대로 물릴 수 있다.
// ─────────────────────────────────────────────────────────────
const fs = require('fs');
const os = require('os');
const path = require('path');

const PROJECT = 'wheresick-5617a';
const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const has = (name) => argv.includes(name);

const DIRECT = has('--direct');
const BASE = opt('--base', DIRECT ? `https://asia-northeast3-${PROJECT}.cloudfunctions.net` : `https://${PROJECT}.web.app`);
const SIDO = opt('--sido', '서울특별시');
const KEY = opt('--key', process.env.LIFELINE_ADMIN_KEY || path.join(os.homedir(), '.secrets', `${PROJECT}-adminsdk.json`));
const TIMEOUT_MS = 25000;

// Hosting rewrite 경로 ↔ 함수 이름 (firebase.json rewrites와 1:1로 맞출 것)
// listKey: 정상 응답에서 배열이 들어있어야 하는 필드
// mustHave: 서울 기준으로 0건이면 이상하다고 봐야 하는 항목 (실시간 항목은 false)
const CHECKS = [
  { name: '응급실 실시간 병상', path: '/api/egen-beds', fn: 'egenBeds', q: { stage1: SIDO }, listKey: 'hospitals', mustHave: false },
  { name: '중증질환 수용가능', path: '/api/egen-severe', fn: 'egenSevere', q: { stage1: SIDO }, listKey: 'hospitals', mustHave: false },
  { name: '권역외상센터', path: '/api/egen-trauma', fn: 'egenTrauma', q: {}, listKey: 'centers', mustHave: true },
  { name: 'AED 설치위치', path: '/api/egen-aed', fn: 'egenAed', q: { stage1: SIDO }, listKey: 'aeds', mustHave: true },
  { name: '병·의원 목록', path: '/api/egen-hospitals', fn: 'egenHospitals', q: { stage1: SIDO }, listKey: 'hospitals', mustHave: true },
  { name: '약국 목록', path: '/api/egen-pharmacy', fn: 'egenPharmacy', q: { stage1: SIDO }, listKey: 'pharmacies', mustHave: true },
  {
    name: 'AI 진료과 상담', path: '/api/dept-consult', fn: 'deptConsult', listKey: null, mustHave: false,
    post: { text: '어제부터 오른쪽 아랫배가 아프고 열이 나요', lang: 'ko' },
  },
];

const url = (c) => {
  const qs = new URLSearchParams(c.q || {}).toString();
  const p = DIRECT ? `/${c.fn}` : c.path;
  return `${BASE}${p}${qs ? `?${qs}` : ''}`;
};

async function hit(c) {
  const t0 = Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const init = { signal: ac.signal };
    if (c.post) {
      init.method = 'POST';
      init.headers = { 'content-type': 'application/json' };
      init.body = JSON.stringify(c.post);
    }
    const res = await fetch(url(c), init);
    const ms = Date.now() - t0;
    const text = await res.text();
    if (!res.ok) {
      // 503 = Cloud Run이 컨테이너를 못 띄움(결제중단·배포누락) / 500 = 함수 내부오류(.env 키 유실 등)
      const hint = res.status === 503 ? ' ← 결제 중단 또는 미배포 의심' : res.status === 500 ? ' ← 서버 키(.env) 유실 의심' : '';
      return { c, ok: false, ms, msg: `HTTP ${res.status}${hint}` };
    }
    let j;
    try { j = JSON.parse(text); }
    catch { return { c, ok: false, ms, msg: `JSON 아님: ${text.slice(0, 60).replace(/\s+/g, ' ')}` }; }
    if (!j.ok) return { c, ok: false, ms, msg: `ok:false ${(j.error || '').toString().slice(0, 60)}` };
    if (!c.listKey) return { c, ok: true, ms, msg: '응답 정상' };
    const list = j[c.listKey];
    if (!Array.isArray(list)) return { c, ok: false, ms, msg: `${c.listKey} 배열 아님` };
    if (list.length === 0 && c.mustHave) return { c, ok: false, ms, msg: `0건 ← ${SIDO}에서 0건은 비정상` };
    if (list.length === 0) return { c, ok: true, warn: true, ms, msg: '0건 (실시간 항목이라 가능은 함)' };
    return { c, ok: true, ms, msg: `${list.length}건` };
  } catch (e) {
    const ms = Date.now() - t0;
    const m = (e && e.message) || String(e);
    return { c, ok: false, ms, msg: e && e.name === 'AbortError' ? `타임아웃 ${TIMEOUT_MS}ms` : m.slice(0, 70) };
  } finally {
    clearTimeout(timer);
  }
}

// 결제 상태 — 이게 false면 함수 7종이 전부 죽는다. 키가 없으면 조용히 건너뜀.
async function checkBilling() {
  if (!fs.existsSync(KEY)) return { skipped: true, msg: `키 없음(${KEY}) — 건너뜀` };
  try {
    const { GoogleAuth } = require(require.resolve('google-auth-library', {
      paths: [path.resolve(__dirname, '..', 'functions')],
    }));
    const auth = new GoogleAuth({ keyFile: KEY, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    const r = await client.request({ url: `https://cloudbilling.googleapis.com/v1/projects/${PROJECT}/billingInfo` });
    const on = !!(r.data && r.data.billingEnabled);
    return { ok: on, msg: on ? `연결됨 (${r.data.billingAccountName})` : '❗ 결제 계정 미연결 — 함수 전체가 503이 됩니다' };
  } catch (e) {
    return { skipped: true, msg: `확인 실패: ${((e && e.message) || String(e)).slice(0, 80)}` };
  }
}

(async () => {
  console.log(`\n라이프라인 API 스모크 — ${BASE}  (지역: ${SIDO}${DIRECT ? ' · 함수 직접호출' : ''})\n`);

  const bill = await checkBilling();
  const billLine = bill.skipped ? `· 결제 상태: ${bill.msg}` : `${bill.ok ? '✅' : '❌'} 결제 상태: ${bill.msg}`;
  console.log(billLine + '\n');

  const targets = CHECKS.filter((c) => !(has('--no-ai') && c.fn === 'deptConsult'));
  const results = await Promise.all(targets.map(hit));

  const pad = (s, n) => s + ' '.repeat(Math.max(0, n - [...s].reduce((a, ch) => a + (ch.charCodeAt(0) > 0x2500 ? 2 : 1), 0)));
  for (const r of results) {
    const mark = r.ok ? (r.warn ? '⚠️ ' : '✅') : '❌';
    console.log(`${mark} ${pad(r.c.name, 20)} ${pad(String(r.ms) + 'ms', 8)} ${r.msg}`);
  }

  const failed = results.filter((r) => !r.ok);
  const billFail = bill.ok === false;
  console.log('');
  if (failed.length === 0 && !billFail) {
    console.log(`전부 정상 (${results.length}종)\n`);
    process.exitCode = 0;
    return;
  }
  if (billFail) console.log('▶ 결제부터 재연결하세요: https://console.cloud.google.com/billing/linkedaccount?project=' + PROJECT);
  if (failed.length) {
    console.log(`▶ 실패 ${failed.length}종: ${failed.map((r) => r.c.name).join(', ')}`);
    if (failed.every((r) => /HTTP 503/.test(r.msg))) console.log('  전부 503 → 개별 버그가 아니라 결제/배포 문제입니다.');
    if (failed.some((r) => /HTTP 500/.test(r.msg))) console.log('  500 포함 → functions/.env 의 EGEN_SERVICE_KEY·CLAUDE_API_KEY 확인 후 재배포.');
    console.log('  로그: firebase functions:log --project ' + PROJECT + ' -n 30');
  }
  console.log('');
  // process.exit()를 쓰면 Windows/Node24에서 auth 핸들이 닫히는 중에 libuv assert로 죽는다
  process.exitCode = 1;
})();
