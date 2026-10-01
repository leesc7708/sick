// PDF 검사: 시트마다 "맨 마지막에 오는 문구"가 실제로 PDF에 있는지 확인한다.
// 고정 높이 + overflow:hidden 조합은 넘친 내용을 조용히 먹어버리므로,
// 쪽수만 세는 검사로는 절대 안 잡힌다. 꼬리 문구를 직접 찾는 것만이 유효하다.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PDF = path.join(__dirname, '라이프라인_시스템소개_안내서.pdf');
const TXT = path.join(process.env.TEMP, 'lifeline-pdf-check.txt');

// [시트번호, 그 시트에서 가장 마지막에 렌더되는 문구]
const TAILS = [
  [1, '문서 기준일'],
  [2, '의료법·약사법 리스크를 설계 단계에서 회피하기 위한 제품 원칙입니다'],
  [3, '경로로만 호출합니다'],
  [4, '설계 근거는 Sheet 10'],
  [5, '만료·접근제어는 서버 연동 후'],
  [6, '기존 기록 호환 유지'],
  [7, '응급·투약 지시문에는 사용하지 않습니다'],
  [8, '데이터베이스 규칙에 명시돼 있습니다'],
  [9, '숨긴 권한은 우회되고, 숨긴 장애는 발견되지 않습니다'],
  [10, '결제·인프라가 꺼지면 그 안의 감시도 함께 죽는다'],
  [11, '1건을 예방하는 것만으로 연 운영비를 크게 상회'],
  [12, '사후 파악에서 사전 대응으로'],
  [13, '홈 최상단에 항상 고정됩니다'],
  [14, '실서비스 전환 전 필수 항목으로 관리하고 있습니다'],
  [15, '광고비 없이 레퍼런스만으로 확산 가능합니다'],
  [16, '디와이산업개발㈜ · 라이프라인'],
];

execFileSync('pdftotext', ['-enc', 'UTF-8', PDF, TXT]);
// 공백을 "한 칸으로 줄이는" 비교는 안 된다 — pdftotext는 줄바꿈 자리에 공백을
// 넣지 않을 때가 있어 "없이 레퍼런스"가 "없이레퍼런스"로 나온다(한국어는 더 잦다).
// 양쪽에서 공백을 전부 지우고 비교해야 오탐이 안 생긴다.
const strip = (s) => s.replace(/\s+/g, '');
const txt = strip(fs.readFileSync(TXT, 'utf8'));

const pages = (fs.readFileSync(TXT, 'utf8').match(/\f/g) || []).length;
console.log(`쪽수: ${pages} (기대 16)`);

let bad = 0;
for (const [n, tail] of TAILS) {
  const ok = txt.includes(strip(tail));
  if (!ok) bad++;
  console.log(`  sheet ${String(n).padStart(2, '0')}  ${ok ? 'OK' : '!! 꼬리 누락 — 잘림'}  ${ok ? '' : '"' + tail + '"'}`);
}

if (pages !== 16) { console.log(`\n쪽수가 16이 아님: ${pages}`); bad++; }
console.log(bad ? `\n실패 ${bad}건` : '\n전체 통과 — 16쪽, 잘린 시트 없음');
process.exit(bad ? 1 : 0);
