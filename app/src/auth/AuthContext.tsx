import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { fetchAccount, UserAccount } from '../services/auth';

interface AuthCtx {
  user: User | null;
  account: UserAccount | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({ user: null, account: null, loading: true, refresh: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAccount = async (u: User | null) => {
    if (!u) { setAccount(null); return; }
    try { setAccount(await fetchAccount(u.uid)); } catch { setAccount(null); }
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

  return <Ctx.Provider value={{ user, account, loading, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
