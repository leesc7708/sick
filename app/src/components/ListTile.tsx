import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { Icon, resolveIcon } from './Icon';

type Tone = 'default' | 'emergency' | 'work';

interface Props {
  icon: string;
  title: string;
  desc?: string;
  onPress: () => void;
  tone?: Tone;
  badge?: ReactNode;
}

export function ListTile({ icon, title, desc, onPress, tone = 'default', badge }: Props) {
  const iconBg =
    tone === 'emergency' ? '#FBE3E4' : tone === 'work' ? colors.workLight : colors.primaryLight;
  const iconColor =
    tone === 'emergency' ? colors.emergency : tone === 'work' ? colors.work : colors.primary;
  const iconName = resolveIcon(icon);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={desc ? `${title}, ${desc}` : title}
      style={({ pressed }) => [
        styles.tile,
        shadow.card,
        pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        {iconName ? <Icon name={iconName} size={24} color={iconColor} /> : <Text style={{ fontSize: 22 }}>{icon}</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[typography.bodyBold, { color: colors.text }]}>{title}</Text>
          {badge ? <View style={{ marginLeft: 6 }}>{badge}</View> : null}
        </View>
        {desc ? (
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>{desc}</Text>
        ) : null}
      </View>
      <Icon name="chevron" size={20} color={colors.g400} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
});
