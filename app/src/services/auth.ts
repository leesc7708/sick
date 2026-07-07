import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { Lang } from '../i18n/translations';

// ── 역할·상태 ──
// general = 미승인(일반사용자, AI 사용불가)
// worker  = 승인된 근로자
// svisor  = 현장관리자 (자기 현장 DB 열람·긴급알림 수신)
// ssvisor = 떠블에스바이저(총괄) — 모든 DB 열람, 전 현장 관리
export type Role = 'general' | 'worker' | 'svisor' | 'ssvisor';
export type AccountStatus = 'pending' | 'active' | 'rejected';

export const isSsvisor = (acc: UserAccount | null) => acc?.role === 'ssvisor'; // 모든 DB 열람 권한
export const isManager = (acc: UserAccount | null) => acc?.role === 'svisor' || acc?.role === 'ssvisor';

export interface UserAccount {
  uid: string;
  username: string;
  name: string;
  phone: string;
  siteId?: string; // 현장은 가입 시 안 받음(관리자가 나중에 배정). 외국인 금지현장 제외
  role: Role;
  status: AccountStatus;
  lang: Lang;
  createdAt?: any;
}

// 아이디 → Firebase Auth용 내부 가짜 이메일 (구글/이메일 아님, 아이디+비번 방식)
const PSEUDO_DOMAIN = 'lifeline.app';
export function usernameToEmail(username: string): string {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return `${clean}@${PSEUDO_DOMAIN}`;
}
export function isValidUsername(username: string): boolean {
  const clean = username.trim().toLowerCase();
  return /^[a-z0-9._-]{3,20}$/.test(clean);
}

/** 회원가입: 아이디/비번 + 이름·전화·현장. 기본 role=general, status=pending(승인대기). */
export async function signup(input: {
  username: string;
  password: string;
  name: string;
  phone: string;
  lang: Lang;
}): Promise<UserAccount> {
  const email = usernameToEmail(input.username);
  const cred = await createUserWithEmailAndPassword(auth, email, input.password);
  const uid = cred.user.uid;
  const account: UserAccount = {
    uid,
    username: input.username.trim().toLowerCase(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    role: 'general',
    status: 'pending',
    lang: input.lang,
  };
  await setDoc(doc(db, 'users', uid), { ...account, createdAt: serverTimestamp() });
  return account;
}

export async function login(username: string, password: string) {
  return signInWithEmailAndPassword(auth, usernameToEmail(username), password);
}

export async function logout() {
  return signOut(auth);
}

export async function fetchAccount(uid: string): Promise<UserAccount | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? ({ uid, ...(snap.data() as any) } as UserAccount) : null;
}

// 승인된(활성) 근로자 이상만 AI 사용 가능. general/pending은 불가.
export function canUseAI(acc: UserAccount | null): boolean {
  return !!acc && acc.status === 'active' && acc.role !== 'general';
}
