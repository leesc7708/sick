import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme/colors';

type Tone = 'new' | 'work' | 'danger' | 'success';

const MAP: Record<Tone, { bg: string; fg: string }> = {
  new: { bg: colors.primaryLight, fg: colors.primaryDark },
  work: { bg: colors.workLight, fg: colors.workDark },
  danger: { bg: '#FFE9EA', fg: colors.emergency },
  success: { bg: '#E3F9EF', fg: '#00A55F' },
};

export function Tag({ label, tone = 'new' }: { label: string; tone?: Tone }) {
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
