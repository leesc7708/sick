import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { radius } from '../theme/colors';
import { useTheme } from '../theme/theme';

type Tone = 'default' | 'red' | 'work' | 'primary';

interface Props {
  label: string;
  selected?: boolean;
  tone?: Tone;
  onPress?: () => void;
}

export function Chip({ label, selected, tone = 'default', onPress }: Props) {
  const c = useTheme();
  const ON: Record<Tone, { bg: string; fg: string }> = {
    default: { bg: c.g800, fg: c.textInverse },
    red: { bg: c.emergency, fg: '#fff' },
    work: { bg: c.work, fg: '#fff' },
    primary: { bg: c.primary, fg: '#fff' },
  };
  const on = ON[tone];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? { backgroundColor: on.bg, borderColor: on.bg }
          : { backgroundColor: c.card, borderColor: c.border },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.txt, { color: selected ? on.fg : c.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  txt: { fontSize: 14, fontWeight: '600' },
});
