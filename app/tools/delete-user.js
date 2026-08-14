#!/usr/bin/env node
/**
 * 라이프라인 회원 1명 완전 삭제 (총괄/master 전용 로컬 도구)
 *
 * 아이디(username) 하나를 지정해 세 곳을 한 번에 정리한다.
 *   1) Firestore users/{uid}
 *   2) Firestore usernames/{username}   (문서키가 아이디)
 *   3) Firebase Auth 계정
 * 한 곳만 지우면 나머지가 유령으로 남는다. (패턴으로 무더기 정리하려면
 * tools/delete-test-accounts.js 를 쓸 것)
 *
 * 삭제 전에 ① 그 uid를 참조하는 다른 컬렉션 문서를 훑어 보여주고,
 * ② 지워질 내용을 JSON 파일로 백업한다. 백업 파일에는 이름·연락처가 들어가므로
 * 저장소에 커밋되지 않도록 .gitignore 에 deleted-*.json 이 등록되어 있다.
 *
 * 기본은 DRY-RUN(미리보기). 실제 삭제는 --yes 를 붙여야 한다. 삭제는 되돌릴 수 없다.
 *
 * 사용법:
 *   node tools/delete-user.js <서비스계정키.json> <아이디>          # 미리보기 + 백업만
 *   node tools/delete-user.js <서비스계정키.json> <아이디> --yes    # 실제 삭제
 */
const path = require('path');
const fs = require('fs');
const admin = require(path.join(__dirname, '..', 'functions', 'node_modules', 'firebase-admin'));

const args = process.argv.slice(2);
const APPLY = args.includes('--yes');
const positional = args.filter((a) => !a.startsWith('--'));

const envKey = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const keyPath = envKey && !/\.json$/i.test(positional[0] || '') ? envKey : positional.shift();
const [username] = positional;

if (!keyPath || !username) {
  console.error('인자가 부족합니다.\n  node tools/delete-user.js <serviceAccountKey.json> <아이디> [--yes]');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(keyPath))),
  projectId: 'wheresick-5617a',
});
const db = admin.firestore();

// 다른 컬렉션에서 이 uid를 가리킬 수 있는 필드들 (crews.ownerUid, workCheckReports.workerUid 등)
const REF_FIELDS = ['uid', 'ownerUid', 'workerUid', 'createdBy', 'targetUid', 'senderUid'];

async function findReferences(uid) {
  const cols = await db.listCollections();
  const out = [];
  for (const c of cols) {
    if (c.id === 'users' || c.id === 'usernames') continue;
    const all = await c.get();
    const hits = all.docs.filter((d) => d.id === uid || REF_FIELDS.some((f) => d.data()[f] === uid));
    if (hits.length) out.push({ collection: c.id, docs: hits.map((d) => d.id) });
  }
  return out;
}

(async () => {
  const snap = await db.collection('users').where('username', '==', username).get();
  if (snap.empty) {
    console.error(`users에 아이디 "${username}" 문서가 없습니다.`);
    process.exit(1);
  }
  if (snap.size > 1) {
    console.error(`아이디 "${username}" 문서가 ${snap.size}건입니다. 수동 확인이 필요합니다.`);
    snap.forEach((d) => console.error(`  uid=${d.id} ${JSON.stringify(d.data())}`));
    process.exit(1);
  }

  const uid = snap.docs[0].id;
  const userDoc = snap.docs[0].data();
  const unameSnap = await db.collection('usernames').doc(username).get();
  let authUser = null;
  try { authUser = await admin.auth().getUser(uid); } catch (e) { /* Auth 계정 없음 = 유령 문서 */ }

  console.log(`\n■ 삭제 대상 — uid=${uid}`);
  console.log(`  아이디 ${userDoc.username} · 이름 ${userDoc.name || '—'} · 연락처 ${userDoc.phone || '—'}`);
  console.log(`  역할/상태 ${userDoc.role} / ${userDoc.status}`);
  console.log(`  users 문서      있음`);
  console.log(`  usernames 문서  ${unameSnap.exists ? '있음' : '없음'}`);
  console.log(`  Auth 계정       ${authUser ? `${authUser.email} (최근 로그인 ${authUser.metadata.lastSignInTime || '—'})` : '없음'}`);

  // 마지막 활성 총괄을 지우면 아무도 회원 승인을 못 하게 된다
  if (userDoc.role === 'ssvisor' && userDoc.status === 'active') {
    const masters = await db.collection('users')
      .where('role', '==', 'ssvisor').where('status', '==', 'active').get();
    const others = masters.docs.filter((d) => d.id !== uid);
    if (!others.length) {
      console.error('\n중단 — 마지막 활성 총괄(ssvisor)입니다. 지우면 회원 승인이 불가능해집니다.');
      console.error('  다른 계정을 먼저 총괄로 올린 뒤 다시 실행하세요. (tools/set-role.js)');
      process.exit(1);
    }
    console.log(`\n  남는 총괄: ${others.map((d) => d.data().username).join(', ')}`);
  }

  const refs = await findReferences(uid);
  console.log(`\n■ 이 계정을 참조하는 다른 문서 — ${refs.length ? '' : '없음'}`);
  refs.forEach((r) => console.log(`  ${r.collection}: ${r.docs.length}건  ${r.docs.slice(0, 5).join(', ')}${r.docs.length > 5 ? ' …' : ''}`));
  if (refs.length) console.log('  ⚠ 이 문서들은 지워지지 않고 남습니다. 필요하면 따로 정리하세요.');

  // 되돌릴 수 없으므로 지워질 내용을 먼저 파일로 남긴다
  const backup = {
    deletedAt: new Date().toISOString(),
    uid,
    user: userDoc,
    usernameDoc: unameSnap.exists ? unameSnap.data() : null,
    auth: authUser ? {
      email: authUser.email,
      created: authUser.metadata.creationTime,
      lastSignIn: authUser.metadata.lastSignInTime,
    } : null,
    danglingRefs: refs,
  };
  const out = path.resolve(process.cwd(), `deleted-${username}-${uid}.json`);
  fs.writeFileSync(out, JSON.stringify(backup, null, 2), 'utf8');
  console.log(`\n백업 저장: ${out}`);

  if (!APPLY) {
    console.log('\n[DRY-RUN] 아무것도 삭제하지 않았습니다. 실제로 지우려면 --yes 를 붙이세요.\n');
    process.exit(0);
  }

  await db.collection('users').doc(uid).delete();
  console.log(`삭제: users/${uid}`);
  if (unameSnap.exists) {
    await db.collection('usernames').doc(username).delete();
    console.log(`삭제: usernames/${username}`);
  }
  if (authUser) {
    await admin.auth().deleteUser(uid);
    console.log(`삭제: Auth ${authUser.email}`);
  }

  const masters = await db.collection('users').where('role', '==', 'ssvisor').get();
  console.log(`\n■ 남은 총괄(ssvisor) ${masters.size}명`);
  masters.forEach((d) => console.log(`  ${String(d.data().username).padEnd(16)} ${d.data().name || '—'} / ${d.data().status}  uid=${d.id}`));
  console.log('');
  process.exit(0);
})().catch((e) => {
  console.error('실패:', e.message);
  process.exit(1);
});
