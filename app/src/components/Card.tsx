import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, shadow } from '../theme/colors';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  flat?: boolean; // 그림자 대신 테두리
}

export function Card({ children, onPress, style, flat }: CardProps) {
  const base = [styles.card, flat ? styles.flat : shadow.card, style];
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...base, pressed && { opacity: 0.92, transform: [{ scale: 0.995 }] }]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={base}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  flat: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
