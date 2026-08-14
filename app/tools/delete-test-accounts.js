#!/usr/bin/env node
/**
 * 라이프라인 테스트 계정 정리 (총괄/master 전용 로컬 도구)
 *
 * E2E·스크린샷 스크립트가 남긴 자동생성 계정을 Auth + Firestore에서 함께 지운다.
 * Auth 계정만 지우면 users/usernames 문서가 유령으로 남으므로 3곳을 모두 정리한다.
 *
 * 기본은 DRY-RUN(미리보기). 실제 삭제는 --yes 를 붙여야 실행된다. 삭제는 되돌릴 수 없다.
 *
 * 사용법:
 *   node tools/delete-test-accounts.js <서비스계정키.json>          # 미리보기
 *   node tools/delete-test-accounts.js <서비스계정키.json> --yes    # 실제 삭제
 */
const path = require('path');
const admin = require(path.join(__dirname, '..', 'functions', 'node_modules', 'firebase-admin'));

const args = process.argv.slice(2);
const APPLY = args.includes('--yes');
const keyPath = args.find((a) => !a.startsWith('--')) || process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  console.error('서비스 계정 키 경로가 필요합니다.\n  node tools/delete-test-accounts.js <serviceAccountKey.json> [--yes]');
  process.exit(1);
}

// 자동생성 테스트 계정 패턴 — 여기에 걸리는 것만 삭제 대상이 된다.
const TEST_PATTERNS = [
  /^shot/,      // 스크린샷 생성 스크립트
  /^e2e/,       // E2E 시나리오
  /^e2r_/,      // E2E 재실행
  /^uf_/,       // uf_ 자동생성
  /^probe_/,    // 접속 확인 probe
];
// 패턴에 걸려도 절대 지우지 않을 계정 (안전장치)
const NEVER_DELETE = new Set(['mmersum', 'busanqlcsk']);

const localPart = (email) => String(email || '').split('@')[0];
const isTest = (email) => {
  const n = localPart(email);
  if (NEVER_DELETE.has(n)) return false;
  return TEST_PATTERNS.some((re) => re.test(n));
};

admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(keyPath))),
  projectId: 'wheresick-5617a',
});
const db = admin.firestore();

async function listAllAuthUsers() {
  const out = [];
  let pageToken;
  do {
    const res = await admin.auth().listUsers(1000, pageToken);
    out.push(...res.users);
    pageToken = res.pageToken;
  } while (pageToken);
  return out;
}

(async () => {
  const all = await listAllAuthUsers();
  const targets = all.filter((u) => isTest(u.email));
  const keep = all.filter((u) => !isTest(u.email));

  console.log(`\n전체 ${all.length}개 · 삭제 대상 ${targets.length}개 · 보존 ${keep.length}개\n`);
  console.log('■ 보존');
  keep.forEach((u) => console.log(`  ${localPart(u.email).padEnd(24)} uid=${u.uid}`));
  console.log('\n■ 삭제 대상');
  targets.forEach((u) => console.log(`  ${localPart(u.email).padEnd(24)} uid=${u.uid}`));

  if (!targets.length) return console.log('\n삭제할 계정이 없습니다.');

  if (!APPLY) {
    console.log('\n[DRY-RUN] 아무것도 삭제하지 않았습니다. 실제로 지우려면 --yes 를 붙이세요.');
    return;
  }

  const uids = targets.map((u) => u.uid);
  const uidSet = new Set(uids);

  // 1) Firestore users/{uid}
  let userDocs = 0;
  for (let i = 0; i < uids.length; i += 400) {
    const batch = db.batch();
    uids.slice(i, i + 400).forEach((uid) => { batch.delete(db.collection('users').doc(uid)); userDocs++; });
    await batch.commit();
  }

  // 2) Firestore usernames/{username} — 문서키가 username이라 uid로 역조회해야 한다
  const unameSnap = await db.collection('usernames').get();
  const unameDocs = unameSnap.docs.filter((d) => uidSet.has(d.data().uid));
  for (let i = 0; i < unameDocs.length; i += 400) {
    const batch = db.batch();
    unameDocs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  // 3) Auth 계정 (한 번에 최대 1000개)
  let deleted = 0, failed = [];
  for (let i = 0; i < uids.length; i += 1000) {
    const res = await admin.auth().deleteUsers(uids.slice(i, i + 1000));
    deleted += res.successCount;
    res.errors.forEach((e) => failed.push(`${uids[i + e.index]}: ${e.error.message}`));
  }

  console.log(`\n완료 — Auth ${deleted}개 삭제 / users 문서 ${userDocs}건 / usernames 문서 ${unameDocs.length}건`);
  if (failed.length) {
    console.log('실패:');
    failed.forEach((f) => console.log('  ' + f));
  }
  process.exit(0);
})().catch((e) => {
  console.error('실패:', e.message);
  process.exit(1);
});
