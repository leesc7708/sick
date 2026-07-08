import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { Icon, resolveIcon } from './Icon';

type Variant = 'primary' | 'success' | 'emergency' | 'work' | 'secondary' | 'outline' | 'ghost';
type Size = 'lg' | 'md' | 'sm';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const BG: Record<Variant, string> = {
  primary: colors.primary,
  success: colors.success,
  emergency: colors.emergency,
  work: colors.work,
  secondary: colors.g100,
  outline: 'transparent',
  ghost: 'transparent',
};
const FG: Record<Variant, string> = {
  primary: '#fff',
  success: '#fff',
  emergency: '#fff',
  work: '#fff',
  secondary: colors.g800,
  outline: colors.primary,
  ghost: colors.g700,
};

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
  style,
}: Props) {
  const h = size === 'lg' ? 56 : size === 'sm' ? 44 : 52;
  const bordered = variant === 'outline' || variant === 'ghost';
  const iconName = resolveIcon(icon);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      style={({ pressed }) => [
        styles.btn,
        {
          height: h,
          backgroundColor: BG[variant],
          borderColor: variant === 'outline' ? colors.primary : colors.g200,
          borderWidth: bordered ? 1.5 : 0,
        },
        pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={FG[variant]} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            iconName ? (
              <View style={{ marginRight: 7 }}>
                <Icon name={iconName} size={size === 'sm' ? 17 : 19} color={FG[variant]} strokeWidth={2.2} />
              </View>
            ) : (
              <Text style={styles.icon}>{icon} </Text>
            )
          ) : null}
          <Text style={[typography.button, { color: FG[variant], fontSize: size === 'sm' ? 14 : 16 }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 16 },
});
