import React from 'react';
import Svg, { Polyline } from 'react-native-svg';
import { colors } from '../theme/colors';

// 라이프라인 심볼 — 생명선(ECG 맥박선). 신뢰 블루 라인 + 응급 레드 스파이크(2색).
// (구 청록·보라 물방울 폐기 — 헬스·뷰티 잔재 제거, 안전/응급 팔레트 정합)
export function LogoMark({ size = 40 }: { size?: number }) {
  const sw = 7;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* 왼쪽 평탄부 → 스파이크 진입 (블루) */}
      <Polyline
        points="8,58 30,58 40,58 46,46"
        fill="none"
        stroke={colors.primary}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* QRS 스파이크 (레드) — 생명 신호 */}
      <Polyline
        points="46,46 52,74 58,26 64,66"
        fill="none"
        stroke={colors.emergency}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 스파이크 이후 평탄부 (블루) */}
      <Polyline
        points="64,66 72,58 92,58"
        fill="none"
        stroke={colors.primary}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
