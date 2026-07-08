// 라이프라인 디자인 시스템 — 토스/E-Gen/WHO 트리아지 벤치마킹 (2026-07-07 디자인팀 리비전)
// 신뢰 블루(브랜드 단일) + WHO 응급 3색(빨강=즉시/주황=곧/초록=대기) + @work 오렌지는 배지 액센트로만
// ⚠️ 오렌지(work)는 주버튼 배경으로 쓰지 말 것 — 브랜드 위계 유지

export const colors = {
  // brand (신뢰 블루 — 주요 액션. 흰 배경 대비 강화를 위해 primaryDark 승격)
  primary: '#1B64DA', // (구 #3182F6) 흰 배경 대비 ~5.9:1 AA 통과
  primaryDark: '#154FB0',
  primaryLight: '#E8F2FE',

  // 보조/상태 (시맨틱 토큰: 의도상 primary와 동일값이나 명시적으로 분리 관리)
  secondary: '#1B64DA',
  emergency: '#DA1E28', // 응급 레드 (구 #F04452 핑크톤 → 의료 경고 레드로 조임, 대비 ↑)
  danger: '#DA1E28',
  warning: '#F5850B', // 주의(곧 진료) 오렌지
  success: '#0E9F6E', // 안전/완료 그린 (구 #00C471 → 텍스트 대비 확보)
  info: '#1B64DA',

  // 응급 신호 3단계(WHO 트리아지 정렬) + 위험도(기존 키 호환)
  riskCritical: '#DA1E28',
  riskHigh: '#F5850B',
  riskMedium: '#F5850B',
  riskLow: '#0E9F6E',
  riskUnknown: '#8B95A1',

  // 그레이 스케일 (토스 grey 팔레트)
  g50: '#F9FAFB',
  g100: '#F2F4F6',
  g200: '#E5E8EB',
  g300: '#D1D6DB',
  g400: '#B0B8C1',
  g500: '#8B95A1',
  g600: '#6B7684',
  g700: '#4E5968',
  g800: '#333D4B',
  g900: '#191F28',

  // 시맨틱 (배경을 한 단계 낮춰 흰 카드가 떠 보이게 — 저대비 '납작함' 해소)
  bg: '#EEF1F4', // (구 #F9FAFB) 카드/배경 명도차 확보
  card: '#FFFFFF',
  border: '#E5E8EB',
  divider: '#F2F4F6',

  // 상태 배경(옅은 톤) — 하드코딩 색 대체용 토큰
  emergencyLight: '#FDECEC',
  warningLight: '#FFF4E5',
  successLight: '#E7F6F0',

  text: '#17181C',
  textSecondary: '#444C56',
  textMuted: '#5B636E', // (구 #8B95A1 대비 3.4:1 → ~5.8:1) 현장 야외 가독성
  textInverse: '#FFFFFF',

  // @work 현장 전용 강조 (당근 오렌지 톤)
  work: '#FF6F0F',
  workDark: '#E5610A',
  workLight: '#FFF1E6',

  // 면책 고지
  disclaimer: '#FFF8E1',
  disclaimerBorder: '#FFE082',
  disclaimerText: '#7A5C00',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
};

// 토스풍 — 그림자는 옅고 부드럽게
export const shadow = {
  card: {
    shadowColor: '#191F28',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10, // (구 0.06) 카드 부양감 강화
    shadowRadius: 8, // (구 12) 더 또렷한 그림자
    elevation: 2,
  },
  floating: {
    shadowColor: '#191F28',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
};
