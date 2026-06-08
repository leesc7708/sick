import React from 'react';
import { Text, View } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';

export function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <View style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
      <Text style={[typography.h3, { color: colors.text }]}>{title}</Text>
      {desc ? (
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>{desc}</Text>
      ) : null}
    </View>
  );
}
