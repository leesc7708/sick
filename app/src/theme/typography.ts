import { TextStyle } from 'react-native';

// 토스/당근풍 — 큰 제목은 굵고 타이트하게, 본문은 넉넉한 행간
// 폰트: Pretendard (App.tsx의 useFonts로 로드). 로드 전엔 fontWeight로 시스템 폰트 폴백.
const REG = 'Pretendard';
const SEMI = 'Pretendard-SemiBold';
const BOLD = 'Pretendard-Bold';
const TAB = ['tabular-nums'] as TextStyle['fontVariant']; // 숫자(119·병상수·거리) 정렬

export const typography: Record<string, TextStyle> = {
  display: { fontFamily: BOLD, fontSize: 32, fontWeight: '800', lineHeight: 42, letterSpacing: -0.5, fontVariant: TAB },
  h1: { fontFamily: BOLD, fontSize: 26, fontWeight: '700', lineHeight: 34, letterSpacing: -0.4 },
  h2: { fontFamily: BOLD, fontSize: 22, fontWeight: '700', lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontFamily: BOLD, fontSize: 18, fontWeight: '700', lineHeight: 26, letterSpacing: -0.2 },
  body: { fontFamily: REG, fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyBold: { fontFamily: SEMI, fontSize: 16, fontWeight: '600', lineHeight: 24 },
  caption: { fontFamily: REG, fontSize: 14, fontWeight: '400', lineHeight: 20 },
  captionBold: { fontFamily: SEMI, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  small: { fontFamily: REG, fontSize: 12, fontWeight: '400', lineHeight: 16 },
  button: { fontFamily: BOLD, fontSize: 16, fontWeight: '700', lineHeight: 22, fontVariant: TAB },
};
