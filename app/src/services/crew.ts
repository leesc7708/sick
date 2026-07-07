import {
  collection, doc, addDoc, setDoc, updateDoc, getDoc, getDocs,
  query, where, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserAccount } from './auth';

// ── 그날의 현장 크루 (당일 임시 세션) ──
export interface Crew {
  id: string;
  ownerUid: string;
  ownerName: string;
  label: string;       // "A현장 3층 배관"
  endTime?: string;    // 작업 종료 예정 시각(에스바이저 설정) — 야간조 대응
  workDate: string;    // YYYY-MM-DD (KST)
  status: 'live' | 'closed';
}

export interface Membership {
  workerUid: string;
  name: string;
  phone?: string;
  crewId: string;
  ownerUid: string;
  ownerName: string;
  label: string;
  workDate: string;
  status: 'active' | 'left';
}

export interface Alert {
  id: string;
  workerUid: string;
  workerName: string;
  crewId?: string;
  notifyUid: string;
  label?: string;
  lat?: number;
  lng?: number;
  status: 'new' | 'ack';
}

export function todayStr(): string {
  const d = new Date();
  const kst = new Date(d.getTime() + 9 * 3600 * 1000); // KST 근사
  return kst.toISOString().slice(0, 10);
}

// ── 에스바이저(관리자) ──
export async function createCrew(owner: UserAccount, label: string, endTime: string): Promise<string> {
  const ref = await addDoc(collection(db, 'crews'), {
    ownerUid: owner.uid, ownerName: owner.name, label, endTime: endTime || '',
    workDate: todayStr(), status: 'live', createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function closeCrew(crewId: string) {
  await updateDoc(doc(db, 'crews', crewId), { status: 'closed', closedAt: serverTimestamp() });
}

// 아이디(username)로 워커 찾기
export async function findWorkerByUsername(username: string): Promise<{ uid: string; name: string; phone?: string } | null> {
  const clean = username.trim().toLowerCase();
  const snap = await getDocs(query(collection(db, 'users'), where('username', '==', clean)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  const x = d.data() as any;
  return { uid: d.id, name: x.name, phone: x.phone };
}

// 워커 강제 추가(이동 포함) — crewMemberships/{workerUid} 덮어쓰기
export async function addWorker(crew: Crew, worker: { uid: string; name: string; phone?: string }) {
  await setDoc(doc(db, 'crewMemberships', worker.uid), {
    workerUid: worker.uid, name: worker.name, phone: worker.phone || '',
    crewId: crew.id, ownerUid: crew.ownerUid, ownerName: crew.ownerName,
    label: crew.label, workDate: crew.workDate, status: 'active', addedAt: serverTimestamp(),
  });
}

export async function removeWorker(workerUid: string) {
  await updateDoc(doc(db, 'crewMemberships', workerUid), { status: 'left' });
}

// 내(에스바이저) 오늘 live 크루 실시간 구독
export function watchMyCrews(ownerUid: string, cb: (crews: Crew[]) => void) {
  const q = query(collection(db, 'crews'), where('ownerUid', '==', ownerUid));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Crew[];
    cb(list.filter((c) => c.status === 'live' && c.workDate === todayStr()));
  });
}

// 특정 크루 멤버 실시간 구독
export function watchMembers(crewId: string, cb: (m: Membership[]) => void) {
  const q = query(collection(db, 'crewMemberships'), where('crewId', '==', crewId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => d.data() as any) as Membership[];
    cb(list.filter((m) => m.status === 'active'));
  });
}

// 내(에스바이저)에게 오는 긴급알림 실시간 구독 (생성자에게만)
export function watchMyAlerts(myUid: string, cb: (a: Alert[]) => void) {
  const q = query(collection(db, 'alerts'), where('notifyUid', '==', myUid));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Alert[];
    cb(list.filter((a) => a.status === 'new' || a.status === 'ack'));
  });
}

export async function ackAlert(alertId: string, byUid: string) {
  await updateDoc(doc(db, 'alerts', alertId), { status: 'ack', ackBy: byUid, ackAt: serverTimestamp() });
}

// ── 워커 ──
export async function getMyMembership(workerUid: string): Promise<Membership | null> {
  const snap = await getDoc(doc(db, 'crewMemberships', workerUid));
  if (!snap.exists()) return null;
  const m = snap.data() as any as Membership;
  return m.status === 'active' && m.workDate === todayStr() ? m : null;
}

export async function leaveMyCrew(workerUid: string) {
  await updateDoc(doc(db, 'crewMemberships', workerUid), { status: 'left' });
}

// 워커 긴급버튼 → alert 생성(생성자=크루 owner에게 라우팅). 위치 포함(가능 시).
export async function sendEmergency(worker: UserAccount, membership: Membership | null): Promise<'sent' | 'no-crew'> {
  if (!membership) return 'no-crew';
  let lat: number | undefined, lng: number | undefined;
  try {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      const pos = await new Promise<any>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 }));
      lat = pos.coords.latitude; lng = pos.coords.longitude;
    }
  } catch {}
  await addDoc(collection(db, 'alerts'), {
    workerUid: worker.uid, workerName: worker.name,
    crewId: membership.crewId, notifyUid: membership.ownerUid, label: membership.label,
    lat: lat ?? null, lng: lng ?? null, status: 'new', createdAt: serverTimestamp(),
  });
  return 'sent';
}
