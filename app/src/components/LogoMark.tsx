import React from 'react';
import Svg, { Defs, LinearGradient, Path, Polyline, Stop } from 'react-native-svg';

// 라이프라인 심볼 — 생명 드롭 + 박동
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="lifelineIce" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#5EE7FF" />
          <Stop offset="1" stopColor="#9B8BFF" />
        </LinearGradient>
      </Defs>
      <Path
        d="M50 22 C61 41 70 50 70 61 a20 20 0 0 1 -40 0 C30 50 39 41 50 22 Z"
        fill="none"
        stroke="url(#lifelineIce)"
        strokeWidth={4.6}
        strokeLinejoin="round"
      />
      <Polyline
        points="36,59 45,59 50,49 55,69 60,59 64,59"
        fill="none"
        stroke="#FF3B5C"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
