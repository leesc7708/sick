import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
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
  const c = useTheme();
  const iconBg =
    tone === 'emergency' ? c.emergencyLight : tone === 'work' ? c.workLight : c.primaryLight;
  const iconColor =
    tone === 'emergency' ? c.emergency : tone === 'work' ? c.work : c.primary;
  const iconName = resolveIcon(icon);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={desc ? `${title}, ${desc}` : title}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: c.card, borderColor: c.border },
        shadow.card,
        pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        {iconName ? <Icon name={iconName} size={24} color={iconColor} /> : <Text style={{ fontSize: 22 }}>{icon}</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[typography.bodyBold, { color: c.text }]}>{title}</Text>
          {badge ? <View style={{ marginLeft: 6 }}>{badge}</View> : null}
        </View>
        {desc ? (
          <Text style={[typography.caption, { color: c.textMuted, marginTop: 2 }]}>{desc}</Text>
        ) : null}
      </View>
      <Icon name="chevron" size={20} color={c.g500} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
});
