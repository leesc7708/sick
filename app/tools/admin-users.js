#!/usr/bin/env node
/**
 * 라이프라인 회원 현황 조회 (총괄/master 전용 로컬 도구)
 *
 * Firebase Auth 계정 + Firestore users 문서를 uid로 합쳐서
 *  - 신규 가입자(status=pending)
 *  - 최근 로그인 이력
 *  - 총괄(ssvisor) = master 계정
 * 을 한 번에 출력한다.
 *
 * 사용법:
 *   node tools/admin-users.js <서비스계정키.json 경로>
 *   node tools/admin-users.js            # GOOGLE_APPLICATION_CREDENTIALS 환경변수 사용
 *
 * 서비스 계정 키 발급:
 *   Firebase 콘솔 → 프로젝트 설정 → 서비스 계정 → "새 비공개 키 생성"
 *   (키 파일은 절대 git에 커밋하지 말 것)
 */
const path = require('path');
const admin = require(path.join(__dirname, '..', 'functions', 'node_modules', 'firebase-admin'));

const keyPath = process.argv[2] || process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  console.error('서비스 계정 키 경로가 필요합니다.\n  node tools/admin-users.js <serviceAccountKey.json>');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(keyPath))),
  projectId: 'wheresick-5617a',
});

const ROLE_KO = { general: '일반', worker: '근로자', svisor: '에스바이저', ssvisor: '떠블에스바이저(총괄)' };
const fmt = (d) => (d ? new Date(d).toLocaleString('ko-KR') : '—');

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
  const [authUsers, snap] = await Promise.all([
    listAllAuthUsers(),
    admin.firestore().collection('users').get(),
  ]);

  const profiles = new Map();
  snap.forEach((d) => profiles.set(d.id, d.data()));

  const rows = authUsers.map((u) => {
    const p = profiles.get(u.uid) || {};
    return {
      uid: u.uid,
      username: p.username || '—',
      name: p.name || u.displayName || '—',
      email: u.email || '—',
      role: p.role || '(문서없음)',
      status: p.status || '(문서없음)',
      signedUp: u.metadata.creationTime,
      lastLogin: u.metadata.lastSignInTime,
      disabled: u.disabled,
    };
  });

  // Firestore 문서만 있고 Auth 계정이 없는 유령 문서도 잡아낸다
  const authUids = new Set(authUsers.map((u) => u.uid));
  const orphans = [...profiles.keys()].filter((uid) => !authUids.has(uid));

  const byNewest = (a, b) => new Date(b.signedUp) - new Date(a.signedUp);
  const line = (r) =>
    `  ${fmt(r.signedUp).padEnd(24)} | 로그인 ${fmt(r.lastLogin).padEnd(24)} | ${String(r.username).padEnd(14)} | ${String(r.name).padEnd(10)} | ${ROLE_KO[r.role] || r.role} / ${r.status}${r.disabled ? ' [정지됨]' : ''}`;

  console.log(`\n총 계정 수: ${rows.length}  (Firestore users 문서 ${profiles.size}개)\n`);

  const masters = rows.filter((r) => r.role === 'ssvisor');
  console.log(`■ 총괄(master / 떠블에스바이저) — ${masters.length}명`);
  masters.length ? masters.sort(byNewest).forEach((r) => console.log(line(r) + `  uid=${r.uid}`)) : console.log('  없음 ⚠ 총괄 계정이 하나도 없으면 회원 승인이 불가능합니다.');

  const pending = rows.filter((r) => r.status === 'pending');
  console.log(`\n■ 승인 대기 = 신규 가입자 — ${pending.length}명`);
  pending.length ? pending.sort(byNewest).forEach((r) => console.log(line(r))) : console.log('  없음');

  console.log(`\n■ 전체 계정 (가입 최신순)`);
  rows.sort(byNewest).forEach((r) => console.log(line(r)));

  const loggedIn = rows.filter((r) => r.lastLogin);
  console.log(`\n■ 로그인 이력 있는 계정 — ${loggedIn.length}명 / 미로그인 ${rows.length - loggedIn.length}명 (최근 로그인순)`);
  loggedIn.sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin)).forEach((r) => console.log(line(r)));

  if (orphans.length) {
    console.log(`\n■ ⚠ Auth 계정 없이 Firestore 문서만 남은 uid — ${orphans.length}건`);
    orphans.forEach((uid) => console.log(`  ${uid}  ${JSON.stringify(profiles.get(uid))}`));
  }

  console.log('');
  process.exit(0);
})().catch((e) => {
  console.error('실패:', e.message);
  process.exit(1);
});
