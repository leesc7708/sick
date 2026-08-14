#!/usr/bin/env node
/**
 * 라이프라인 회원 역할·상태 변경 (총괄/master 전용 로컬 도구)
 *
 * 아이디(username)로 users 문서를 찾아 role/status 를 바꾼다.
 * firestore.rules 상 role/status 변경은 ssvisor만 가능하지만, 이 도구는
 * 서비스 계정(관리자 SDK)으로 규칙을 우회하므로 총괄이 하나도 없을 때의
 * 복구 경로이기도 하다.
 *
 * 기본은 DRY-RUN(미리보기). 실제 반영은 --yes 를 붙여야 한다.
 *
 * 사용법:
 *   node tools/set-role.js <서비스계정키.json> <아이디> <역할> [상태]        # 미리보기
 *   node tools/set-role.js <서비스계정키.json> <아이디> <역할> [상태] --yes  # 실제 반영
 *
 * 예:
 *   node tools/set-role.js key.json dy17715 ssvisor --yes        # 총괄로 승격(상태 active)
 *   node tools/set-role.js key.json hong worker --yes            # 가입 승인 = 근로자로 활성화
 *   node tools/set-role.js key.json hong general rejected --yes  # 가입 거부
 *
 * 역할: general(미승인) | worker(근로자) | svisor(현장관리자) | ssvisor(총괄)
 * 상태: pending(승인대기) | active(활성) | rejected(거부)   ※ 생략 시 active
 */
const path = require('path');
const admin = require(path.join(__dirname, '..', 'functions', 'node_modules', 'firebase-admin'));

const ROLES = ['general', 'worker', 'svisor', 'ssvisor'];
const STATUSES = ['pending', 'active', 'rejected'];
const ROLE_KO = { general: '일반(미승인)', worker: '근로자', svisor: '에스바이저(현장관리자)', ssvisor: '떠블에스바이저(총괄)' };

const args = process.argv.slice(2);
const APPLY = args.includes('--yes');
const positional = args.filter((a) => !a.startsWith('--'));

const usage = '  node tools/set-role.js <serviceAccountKey.json> <아이디> <역할> [상태] [--yes]\n' +
  `  역할: ${ROLES.join(' | ')}\n  상태: ${STATUSES.join(' | ')} (생략 시 active)`;

// 키는 위치인자 첫번째 또는 환경변수. 키를 환경변수로 준 경우 위치인자는 아이디부터 시작한다.
const envKey = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const keyPath = envKey && !/\.json$/i.test(positional[0] || '') ? envKey : positional.shift();
const [username, role, status = 'active'] = positional;

if (!keyPath || !username || !role) {
  console.error('인자가 부족합니다.\n' + usage);
  process.exit(1);
}
if (!ROLES.includes(role)) {
  console.error(`알 수 없는 역할: ${role}\n  가능: ${ROLES.join(' | ')}`);
  process.exit(1);
}
if (!STATUSES.includes(status)) {
  console.error(`알 수 없는 상태: ${status}\n  가능: ${STATUSES.join(' | ')}`);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(keyPath))),
  projectId: 'wheresick-5617a',
});
const db = admin.firestore();

const desc = (r, s) => `${ROLE_KO[r] || r} / ${s}`;

(async () => {
  const snap = await db.collection('users').where('username', '==', username).get();
  if (snap.empty) {
    console.error(`users에 아이디 "${username}" 문서가 없습니다.`);
    process.exit(1);
  }
  // 동명 아이디가 여러 건이면 어느 쪽을 고칠지 알 수 없으므로 손대지 않는다
  if (snap.size > 1) {
    console.error(`아이디 "${username}" 문서가 ${snap.size}건입니다. 수동 확인이 필요합니다.`);
    snap.forEach((d) => console.error(`  uid=${d.id} ${JSON.stringify(d.data())}`));
    process.exit(1);
  }

  const ref = snap.docs[0].ref;
  const before = snap.docs[0].data();

  console.log(`\n■ 대상 — uid=${ref.id}`);
  console.log(`  아이디 ${before.username} · 이름 ${before.name || '—'} · 연락처 ${before.phone || '—'}`);
  console.log(`  변경 전: ${desc(before.role, before.status)}`);
  console.log(`  변경 후: ${desc(role, status)}`);

  if (before.role === role && before.status === status) {
    console.log('\n이미 같은 값입니다. 변경할 것이 없습니다.\n');
    process.exit(0);
  }

  // 마지막 남은 활성 총괄을 끌어내리면 아무도 회원 승인을 못 하게 된다
  const losingMaster = before.role === 'ssvisor' && before.status === 'active'
    && !(role === 'ssvisor' && status === 'active');
  if (losingMaster) {
    const masters = await db.collection('users')
      .where('role', '==', 'ssvisor').where('status', '==', 'active').get();
    const others = masters.docs.filter((d) => d.id !== ref.id);
    if (!others.length) {
      console.error('\n중단 — 마지막 활성 총괄(ssvisor)입니다. 강등하면 회원 승인이 불가능해집니다.');
      console.error('  다른 계정을 먼저 총괄로 올린 뒤 다시 실행하세요.');
      process.exit(1);
    }
    console.log(`  (남는 총괄: ${others.map((d) => d.data().username).join(', ')})`);
  }

  if (!APPLY) {
    console.log('\n[DRY-RUN] 아무것도 바꾸지 않았습니다. 실제로 반영하려면 --yes 를 붙이세요.\n');
    process.exit(0);
  }

  await ref.update({ role, status });
  const after = (await ref.get()).data();
  console.log(`\n완료 — ${desc(after.role, after.status)}`);

  const masters = await db.collection('users').where('role', '==', 'ssvisor').get();
  console.log(`\n■ 현재 총괄(ssvisor) ${masters.size}명`);
  masters.forEach((d) => console.log(`  ${String(d.data().username).padEnd(16)} ${d.data().name || '—'} / ${d.data().status}  uid=${d.id}`));
  console.log('');
  process.exit(0);
})().catch((e) => {
  console.error('실패:', e.message);
  process.exit(1);
});
