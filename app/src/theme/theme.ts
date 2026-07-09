import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────
// 라이프라인 테마 시스템 (2026-07-09 프리미엄 리뉴얼)
//  - 5팀 벤치마킹(NVIDIA·Linear/Vercel·Stripe·Apple·AMD) 종합:
//    "다크 셸 + 1px hairline + 절제된 시그니처(바이탈 시안) + 응급 고대비 예외"
//  - 기본=라이트(야외·직사광 안전), 토글→다크. 색 키는 기존 colors.ts와 100% 동일(화면 호환).
//  - 응급 3색(빨강/주황/초록)은 두 테마 모두 명확성 우선(장식으로 묻히지 않게).
// ─────────────────────────────────────────────────────────────

export type Palette = {
  primary: string; primaryDark: string; primaryLight: string; secondary: string;
  emergency: string; danger: string; warning: string; success: string; info: string;
  riskCritical: string; riskHigh: string; riskMedium: string; riskLow: string; riskUnknown: string;
  g50: string; g100: string; g200: string; g300: string; g400: string; g500: string; g600: string; g700: string; g800: string; g900: string;
  bg: string; card: string; border: string; divider: string;
  emergencyLight: string; warningLight: string; successLight: string;
  text: string; textSecondary: string; textMuted: string; textInverse: string;
  work: string; workDark: string; workLight: string;
  disclaimer: string; disclaimerBorder: string; disclaimerText: string;
  vital: string; // 신규: 브랜드 시그니처(ECG펄스/LIVE/포커스) 액센트
};

// ── 라이트 (기본) — 프리미엄 클리니컬: 딥네이비 잉크 + 시안 브랜드 + 쿨 뉴트럴 ──
export const lightTheme: Palette = {
  primary: '#0E7490', primaryDark: '#0B5566', primaryLight: '#E3F6FB', secondary: '#0E7490',
  emergency: '#DA1E28', danger: '#DA1E28', warning: '#F5850B', success: '#0E9F6E', info: '#0E7490',
  riskCritical: '#DA1E28', riskHigh: '#F5850B', riskMedium: '#F5850B', riskLow: '#0E9F6E', riskUnknown: '#8B95A1',
  g50: '#F7F9FB', g100: '#F1F4F7', g200: '#E4E9F0', g300: '#D3DAE3', g400: '#B2BAC6', g500: '#8A94A3', g600: '#68727F', g700: '#4B5563', g800: '#333D4B', g900: '#111726',
  bg: '#F1F4F8', card: '#FFFFFF', border: '#E4E9F0', divider: '#EEF2F6',
  emergencyLight: '#FDECEC', warningLight: '#FFF4E5', successLight: '#E7F6F0',
  text: '#0C1220', textSecondary: '#3A4453', textMuted: '#5B6673', textInverse: '#FFFFFF',
  work: '#E5610A', workDark: '#C4520A', workLight: '#FFF1E6',
  disclaimer: '#FFF8E1', disclaimerBorder: '#FFE082', disclaimerText: '#7A5C00',
  vital: '#0891B2',
};

// ── 다크 — "바이탈 모니터": near-black 베이스 + 서피스 명도계단 + 시안 액센트 ──
export const darkTheme: Palette = {
  primary: '#22D3EE', primaryDark: '#0E7490', primaryLight: 'rgba(34,211,238,0.15)', secondary: '#22D3EE',
  emergency: '#FF3B44', danger: '#FF3B44', warning: '#F6A723', success: '#35D6A0', info: '#22D3EE',
  riskCritical: '#FF3B44', riskHigh: '#F6A723', riskMedium: '#F6A723', riskLow: '#35D6A0', riskUnknown: '#8A94A3',
  // 다크 그레이 계단(저번호=어두운 서피스, 고번호=밝은 텍스트) — 라이트와 의미 방향 동일하게 유지
  g50: '#10151D', g100: '#161C26', g200: '#1E2632', g300: '#2A323F', g400: '#3A4453', g500: '#8A94A3', g600: '#AEB7C4', g700: '#C6CDD8', g800: '#E2E7EE', g900: '#F3F6FA',
  bg: '#0B0E14', card: '#12161F', border: '#232A36', divider: '#1A212C',
  emergencyLight: '#2A1416', warningLight: '#2A2012', successLight: '#0E241C',
  text: '#F3F6FA', textSecondary: '#C2CAD6', textMuted: '#9AA6B6', textInverse: '#0B0E14',
  work: '#F6A723', workDark: '#D98F16', workLight: '#2A2012',
  disclaimer: '#241E0E', disclaimerBorder: '#4A3D14', disclaimerText: '#E8C766',
  vital: '#22D3EE',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, pill: 999 };
export const shadow = {
  card: { shadowColor: '#0B1020', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  floating: { shadowColor: '#0B1020', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 6 },
};

export type ThemeMode = 'light' | 'dark';
const THEME_KEY = 'lifeline_theme_mode';

type Ctx = { mode: ThemeMode; palette: Palette; toggle: () => void; setMode: (m: ThemeMode) => void };
const ThemeCtx = createContext<Ctx>({ mode: 'light', palette: lightTheme, toggle: () => {}, setMode: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light'); // 기본 라이트
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => { if (v === 'dark' || v === 'light') setModeState(v); }).catch(() => {});
  }, []);
  const setMode = (m: ThemeMode) => { setModeState(m); AsyncStorage.setItem(THEME_KEY, m).catch(() => {}); };
  const toggle = () => setMode(mode === 'dark' ? 'light' : 'dark');
  const palette = mode === 'dark' ? darkTheme : lightTheme;
  const value = useMemo(() => ({ mode, palette, toggle, setMode }), [mode]);
  return React.createElement(ThemeCtx.Provider, { value }, children);
}

/** 활성 팔레트 반환 (screen: const c = useTheme(); c.bg …) */
export const useTheme = (): Palette => useContext(ThemeCtx).palette;
/** 모드·전환 제어 (토글 스위치용) */
export const useThemeMode = () => { const { mode, toggle, setMode } = useContext(ThemeCtx); return { mode, toggle, setMode }; };
