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

// 이름·역할이 문장 중간에 들어가는 문구용 치환자. 언어마다 어순이 달라 문자열 이어붙이기로는
// "Reject 김철수?" 같은 문장을 만들 수 없다. 번역문에 {who} 자리를 두고 여기서 채운다.
//   fill(t('ua_reject_m'), { who: '김철수' })
export const fill = (s: string, vars: Record<string, string>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
