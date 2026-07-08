import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { fetchAccount, UserAccount } from '../services/auth';
import { storage } from '../services/storage';

interface AuthCtx {
  user: User | null;
  account: UserAccount | null;
  onboarded: boolean; // 계정별 온보딩 완료 여부 — 초기 라우팅 게이팅용
  loading: boolean;
  refresh: () => Promise<void>;
  markOnboarded: () => void; // 온보딩 완료 시 컨텍스트 즉시 반영
}

const Ctx = createContext<AuthCtx>({ user: null, account: null, onboarded: false, loading: true, refresh: async () => {}, markOnboarded: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  // account + onboarded를 함께 로드 (초기 라우트 결정을 위해 로그인 시점에 둘 다 확정)
  const loadAccount = async (u: User | null) => {
    if (!u) { setAccount(null); setOnboarded(false); return; }
    try { setAccount(await fetchAccount(u.uid)); } catch { setAccount(null); }
    try { setOnboarded(await storage.getOnboarded(u.uid)); } catch { setOnboarded(false); }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      await loadAccount(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const refresh = async () => { await loadAccount(user); };
  const markOnboarded = () => setOnboarded(true);

  return <Ctx.Provider value={{ user, account, onboarded, loading, refresh, markOnboarded }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
