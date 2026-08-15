// 번역 키 정합성 검사 — 7개 언어 키가 완전히 같은지 + 코드에서 쓰는 t('키')가 실제 정의돼 있는지.
// 언어 한 곳에만 키를 빠뜨리면 t()가 조용히 ko로 폴백해 "번역된 줄 알았는데 한국어"가 되므로,
// i18n 작업 뒤에는 tsc·빌드와 함께 이걸 돌린다.
//   실행: node tools/check-i18n.js   (app/ 에서)
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src');
const file = fs.readFileSync(path.join(SRC, 'i18n', 'translations.ts'), 'utf8').replace(/\r\n/g, '\n');

// 문자열 리터럴을 비워 값 안의 "VD:" 같은 것이 키로 오인되지 않게 한다.
// 두 따옴표를 하나의 교차 패턴으로 — 따로 돌리면 "Today's" 의 아포스트로피에서 짝이 어긋난다.
const stripStrings = (s) => s.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, '""');

const LANGS = ['ko', 'en', 'zh', 'ja', 'vi', 'th', 'es'];
const blocks = {};
for (const l of LANGS) {
  const m = file.match(new RegExp(`\\n  ${l}: \\{\\n([\\s\\S]*?)\\n  \\},`));
  if (!m) { console.error(`블록 없음: ${l}`); process.exit(1); }
  blocks[l] = new Set([...stripStrings(m[1]).matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g)].map((x) => x[1]));
}

let bad = 0;
const ko = blocks.ko;
console.log(`ko 키 개수: ${ko.size}`);
for (const l of LANGS.slice(1)) {
  const missing = [...ko].filter((k) => !blocks[l].has(k));
  const extra = [...blocks[l]].filter((k) => !ko.has(k));
  if (missing.length) { console.error(`[${l}] 누락 ${missing.length}: ${missing.join(', ')}`); bad++; }
  if (extra.length) { console.error(`[${l}] ko에 없음 ${extra.length}: ${extra.join(', ')}`); bad++; }
  if (!missing.length && !extra.length) console.log(`[${l}] OK (${blocks[l].size})`);
}

// 전역 t()를 쓰는 파일만 검사 — 자체 다국어 맵으로 t/tr를 따로 정의한 화면(로그인·가입·표현집)은 제외
const used = new Map();
const skipped = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== '_legacy') walk(p); continue; }
    if (!/\.tsx?$/.test(e.name)) continue;
    const src = fs.readFileSync(p, 'utf8');
    if (!/\bt\('/.test(src)) continue;
    if (!/useLang\(\)/.test(src) || /\bconst t\s*=/.test(src)) { skipped.push(path.relative(SRC, p)); continue; }
    for (const m of src.matchAll(/\bt\('([a-zA-Z0-9_]+)'\)/g)) if (!used.has(m[1])) used.set(m[1], p);
  }
}
walk(SRC);
const undef = [...used].filter(([k]) => !ko.has(k));
if (undef.length) {
  console.error(`\n정의되지 않은 t() 키 ${undef.length}건:`);
  for (const [k, p] of undef) console.error(`  ${k}  (${path.relative(SRC, p)})`);
  bad++;
} else {
  console.log(`\n전역 t() 사용 키 ${used.size}개 전부 정의됨 ✅`);
}
if (skipped.length) console.log(`(자체 다국어 맵이라 제외: ${skipped.join(', ')})`);
process.exit(bad ? 1 : 0);
