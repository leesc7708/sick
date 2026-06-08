// 라이프라인 디자인 시스템 — 토스/당근 벤치마킹 (2026-06-08 리브랜딩)
// 신뢰감 있는 토스 블루 + 응급 레드 포인트 + 현장(@work) 당근 오렌지 액센트

export const colors = {
  // brand (토스 블루 계열 — 주요 액션/신뢰)
  primary: '#3182F6',
  primaryDark: '#1B64DA',
  primaryLight: '#E8F2FE',

  // 보조/상태
  secondary: '#3182F6',
  emergency: '#F04452', // 응급 레드 (가장 강한 경고)
  danger: '#F04452',
  warning: '#FF9500',
  success: '#00C471', // 안전/완료 그린
  info: '#3182F6',

  // 응급 신호 3단계 + 위험도(기존 키 호환)
  riskCritical: '#F04452',
  riskHigh: '#FF6B35',
  riskMedium: '#FF9500',
  riskLow: '#00C471',
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

  // 시맨틱
  bg: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E8EB',
  divider: '#F2F4F6',

  text: '#191F28',
  textSecondary: '#4E5968',
  textMuted: '#8B95A1',
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
    shadowOpacity: 0.06,
    shadowRadius: 12,
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
