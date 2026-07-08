import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

// ─────────────────────────────────────────────────────────────
// 라인 아이콘 세트 (react-native-svg 기반, 무료·오프라인·브랜드 통제)
//  - 기존 이모지(📝🩺🏥…)를 통일된 stroke 아이콘으로 자동 교체하기 위한 세트.
//  - ListTile/PrimaryButton 이 resolveIcon(이모지)로 이름을 찾아 <Icon>로 렌더.
//  - 디자인팀 P0: "이모지 전면 사용이 싼티 최대 원인" → 이 세트로 해소.
// ─────────────────────────────────────────────────────────────

export type IconName =
  | 'document' | 'file' | 'clipboard' | 'stethoscope' | 'hospital' | 'alert'
  | 'check' | 'pill' | 'chart' | 'clock' | 'settings' | 'phone' | 'search'
  | 'link' | 'upload' | 'plus' | 'map' | 'people' | 'chevron' | 'vest' | 'user' | 'speech';

const KNOWN: IconName[] = [
  'document', 'file', 'clipboard', 'stethoscope', 'hospital', 'alert', 'check', 'pill',
  'chart', 'clock', 'settings', 'phone', 'search', 'link', 'upload', 'plus', 'map', 'people', 'chevron',
  'vest', 'user', 'speech',
];

// 이모지 → 아이콘 이름 매핑 (기존 화면의 icon="📝" 를 손대지 않고 자동 변환)
const EMOJI_MAP: Record<string, IconName> = {
  '📝': 'document',
  '📄': 'file',
  '📋': 'clipboard',
  '🩺': 'stethoscope',
  '🏥': 'hospital',
  '⚠️': 'alert',
  '🚨': 'alert',
  '✅': 'check',
  '💊': 'pill',
  '📊': 'chart',
  '🕐': 'clock',
  '⚙️': 'settings',
  '📞': 'phone',
  '🔎': 'search',
  '🔗': 'link',
  '📤': 'upload',
  '＋': 'plus',
  '+': 'plus',
  '🗺️': 'map',
  '👥': 'people',
  '🦺': 'vest',
  '🙂': 'user',
  '👤': 'user',
  '🗣️': 'speech',
};

/** 문자열(이모지 또는 아이콘 이름)을 아이콘 이름으로 해석. 못 찾으면 null(→ 원문 텍스트 폴백) */
export function resolveIcon(s?: string): IconName | null {
  if (!s) return null;
  if (EMOJI_MAP[s]) return EMOJI_MAP[s];
  if ((KNOWN as string[]).includes(s)) return s as IconName;
  return null;
}

export function Icon({ name, size = 24, color = '#17181C', strokeWidth = 2 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const p = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  const glyphs: Record<IconName, React.ReactNode> = {
    document: (
      <>
        <Rect x={5} y={3} width={14} height={18} rx={2.5} {...p} />
        <Line x1={9} y1={8} x2={15} y2={8} {...p} />
        <Line x1={9} y1={12} x2={15} y2={12} {...p} />
        <Line x1={9} y1={16} x2={13} y2={16} {...p} />
      </>
    ),
    file: (
      <>
        <Path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" {...p} />
        <Polyline points="14 3 14 8 19 8" {...p} />
        <Line x1={9} y1={13} x2={15} y2={13} {...p} />
        <Line x1={9} y1={16} x2={13} y2={16} {...p} />
      </>
    ),
    clipboard: (
      <>
        <Rect x={5} y={4} width={14} height={17} rx={2.5} {...p} />
        <Rect x={9} y={2} width={6} height={4} rx={1} {...p} />
        <Line x1={9} y1={11} x2={15} y2={11} {...p} />
        <Line x1={9} y1={15} x2={14} y2={15} {...p} />
      </>
    ),
    stethoscope: (
      <>
        <Path d="M6 3v5a5 5 0 0 0 10 0V3" {...p} />
        <Circle cx={6} cy={3} r={1.3} fill={color} />
        <Circle cx={16} cy={3} r={1.3} fill={color} />
        <Path d="M11 13v2a5 5 0 0 0 5 5 4 4 0 0 0 4-4v-2" {...p} />
        <Circle cx={20} cy={12} r={2.2} {...p} />
      </>
    ),
    hospital: (
      <>
        <Path d="M4 8l8-4 8 4" {...p} />
        <Rect x={5} y={8} width={14} height={13} rx={2} {...p} />
        <Line x1={12} y1={11} x2={12} y2={17} {...p} />
        <Line x1={9} y1={14} x2={15} y2={14} {...p} />
      </>
    ),
    alert: (
      <>
        <Path d="M12 3.5L22 20H2z" {...p} />
        <Line x1={12} y1={10} x2={12} y2={14} {...p} />
        <Circle cx={12} cy={17} r={0.9} fill={color} />
      </>
    ),
    check: (
      <>
        <Circle cx={12} cy={12} r={9} {...p} />
        <Polyline points="8 12.5 11 15.5 16.5 9.5" {...p} />
      </>
    ),
    pill: (
      <>
        <Rect x={3} y={8} width={18} height={8} rx={4} {...p} />
        <Line x1={12} y1={8} x2={12} y2={16} {...p} />
      </>
    ),
    chart: (
      <>
        <Line x1={4} y1={20} x2={20} y2={20} {...p} />
        <Rect x={6} y={12} width={3} height={6} rx={1} {...p} />
        <Rect x={11} y={8} width={3} height={10} rx={1} {...p} />
        <Rect x={16} y={14} width={3} height={4} rx={1} {...p} />
      </>
    ),
    clock: (
      <>
        <Circle cx={12} cy={12} r={9} {...p} />
        <Path d="M12 7v5l3.5 2" {...p} />
      </>
    ),
    settings: (
      <>
        <Line x1={4} y1={7} x2={20} y2={7} {...p} />
        <Line x1={4} y1={12} x2={20} y2={12} {...p} />
        <Line x1={4} y1={17} x2={20} y2={17} {...p} />
        <Circle cx={9} cy={7} r={2.3} fill={color} />
        <Circle cx={15} cy={12} r={2.3} fill={color} />
        <Circle cx={8} cy={17} r={2.3} fill={color} />
      </>
    ),
    phone: (
      <Path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        {...p}
      />
    ),
    search: (
      <>
        <Circle cx={11} cy={11} r={7} {...p} />
        <Line x1={20.5} y1={20.5} x2={16.5} y2={16.5} {...p} />
      </>
    ),
    link: (
      <>
        <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" {...p} />
        <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" {...p} />
      </>
    ),
    upload: (
      <>
        <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" {...p} />
        <Polyline points="17 8 12 3 7 8" {...p} />
        <Line x1={12} y1={3} x2={12} y2={15} {...p} />
      </>
    ),
    plus: (
      <>
        <Line x1={12} y1={5} x2={12} y2={19} {...p} />
        <Line x1={5} y1={12} x2={19} y2={12} {...p} />
      </>
    ),
    map: (
      <>
        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" {...p} />
        <Circle cx={12} cy={10} r={3} {...p} />
      </>
    ),
    people: (
      <>
        <Path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...p} />
        <Circle cx={9.5} cy={7} r={4} {...p} />
        <Path d="M22 21v-2a4 4 0 0 0-3-3.87" {...p} />
        <Path d="M16 3.13a4 4 0 0 1 0 7.75" {...p} />
      </>
    ),
    chevron: <Polyline points="9 6 15 12 9 18" {...p} />,
    vest: (
      <>
        <Path d="M9 3l3 3 3-3" {...p} />
        <Path d="M8 3L5 5v15h14V5l-3-2" {...p} />
        <Line x1={12} y1={6} x2={12} y2={20} {...p} />
      </>
    ),
    user: (
      <>
        <Circle cx={12} cy={8} r={4} {...p} />
        <Path d="M5 21a7 7 0 0 1 14 0" {...p} />
      </>
    ),
    speech: (
      <Path d="M21 12a8 8 0 0 1-8 8H4l2.5-3A8 8 0 1 1 21 12z" {...p} />
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {glyphs[name]}
    </Svg>
  );
}
