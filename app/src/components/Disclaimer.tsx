import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors as _staticColors, radius, spacing } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';

interface DisclaimerProps {
  text?: string;
  compact?: boolean;
}

const DEFAULT_TEXT =
  '⚠️ 본 앱은 의료 참고 정보를 제공합니다. 진단/처방을 대체하지 않으며, 정확한 진단은 의료기관에서 받으세요.';

export function Disclaimer({ text = DEFAULT_TEXT, compact = false }: DisclaimerProps) {
  const colors = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: colors.disclaimer, borderColor: colors.disclaimerBorder }, compact && styles.compact]}>
      <Text style={[typography.caption, styles.text, { color: colors.disclaimerText }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: _staticColors.disclaimer,
    borderColor: _staticColors.disclaimerBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  compact: {
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  text: {
    color: _staticColors.disclaimerText,
  },
});
