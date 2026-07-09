import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius } from '../theme/colors';
import { useTheme } from '../theme/theme';

type Tone = 'new' | 'work' | 'danger' | 'success';

// [주석보존] 정적 팔레트 기반 MAP → 라이트/다크 테마 대응 위해 컴포넌트 내부로 이동 (2026-07-09)
// const MAP: Record<Tone, { bg: string; fg: string }> = {
//   new: { bg: colors.primaryLight, fg: colors.primaryDark },
//   work: { bg: colors.workLight, fg: colors.workDark },
//   danger: { bg: '#FFE9EA', fg: colors.emergency },
//   success: { bg: '#E3F9EF', fg: '#00A55F' },
// };

export function Tag({ label, tone = 'new' }: { label: string; tone?: Tone }) {
  const colors = useTheme();
  const MAP: Record<Tone, { bg: string; fg: string }> = {
    new: { bg: colors.primaryLight, fg: colors.primaryDark },
    work: { bg: colors.workLight, fg: colors.workDark },
    danger: { bg: colors.emergencyLight, fg: colors.emergency },
    success: { bg: colors.successLight, fg: colors.success },
  };
  const m = MAP[tone];
  return (
    <View style={[styles.tag, { backgroundColor: m.bg }]}>
      <Text style={[styles.txt, { color: m.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { borderRadius: radius.sm, paddingVertical: 3, paddingHorizontal: 8, alignSelf: 'flex-start' },
  txt: { fontSize: 11, fontWeight: '700' },
});
