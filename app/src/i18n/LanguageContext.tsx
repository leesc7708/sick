import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lang, translations } from './translations';
import { storage } from '../services/storage';

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };

const LanguageContext = createContext<Ctx>({ lang: 'ko', setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko');

  useEffect(() => {
    storage.getLang().then((l) => {
      if (l) setLangState(l);
    });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    storage.setLang(l);
  };

  const t = (key: string) => translations[lang]?.[key] ?? translations.ko[key] ?? key;

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
