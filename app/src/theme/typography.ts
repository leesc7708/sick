import { TextStyle } from 'react-native';

// 토스/당근풍 — 큰 제목은 굵고 타이트하게, 본문은 넉넉한 행간
export const typography: Record<string, TextStyle> = {
  display: { fontSize: 32, fontWeight: '800', lineHeight: 42, letterSpacing: -0.5 },
  h1: { fontSize: 26, fontWeight: '700', lineHeight: 34, letterSpacing: -0.4 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '700', lineHeight: 26, letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  captionBold: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  small: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
};
