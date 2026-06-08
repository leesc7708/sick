import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../theme/colors';

type Tone = 'default' | 'red' | 'work' | 'primary';

interface Props {
  label: string;
  selected?: boolean;
  tone?: Tone;
  onPress?: () => void;
}

const ON: Record<Tone, { bg: string; fg: string }> = {
  default: { bg: colors.g800, fg: '#fff' },
  red: { bg: colors.emergency, fg: '#fff' },
  work: { bg: colors.work, fg: '#fff' },
  primary: { bg: colors.primary, fg: '#fff' },
};

export function Chip({ label, selected, tone = 'default', onPress }: Props) {
  const on = ON[tone];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? { backgroundColor: on.bg, borderColor: on.bg }
          : { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.txt, { color: selected ? on.fg : colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  txt: { fontSize: 14, fontWeight: '600' },
});
