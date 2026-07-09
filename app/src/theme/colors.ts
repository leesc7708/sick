// ─────────────────────────────────────────────────────────────
// 2026-07-09 프리미엄 리뉴얼: 색 토큰을 theme.ts(light/dark)로 이전.
//  - 백워드 호환: 기존 `import { colors } from '../theme/colors'` 는 라이트(기본) 팔레트를 그대로 받는다.
//    → 화면 수정 없이 전 앱이 새 프리미엄 라이트 룩으로 즉시 전환됨(키 100% 동일).
//  - 런타임 다크/라이트 전환이 필요한 화면은 theme.ts의 `useTheme()`를 쓴다.
//  - spacing/radius/shadow도 theme.ts로 이전 후 여기서 재-export(기존 import 경로 유지).
// [주석보존] 구 팔레트(토스 블루 #1B64DA 단일)는 theme.ts lightTheme의 근간으로 흡수됨.
// ─────────────────────────────────────────────────────────────
export { lightTheme as colors, spacing, radius, shadow } from './theme';
