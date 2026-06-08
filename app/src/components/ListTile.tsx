import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow } from '../theme/colors';
import { typography } from '../theme/typography';

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
    tone === 'emergency' ? '#FFE9EA' : tone === 'work' ? colors.workLight : colors.primaryLight;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        shadow.card,
        pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
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
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  arrow: { fontSize: 26, fontWeight: '300', color: colors.g300 },
});
