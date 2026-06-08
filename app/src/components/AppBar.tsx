import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';

interface Props {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  emergency?: boolean;
}

export function AppBar({ title, onBack, right, emergency }: Props) {
  const bg = emergency ? colors.emergency : colors.card;
  const fg = emergency ? '#fff' : colors.text;
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: bg }}>
      <View style={styles.bar}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.side}>
            <Text style={[styles.back, { color: emergency ? '#fff' : colors.g800 }]}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.side} />
        )}
        <Text style={[typography.h3, { color: fg, flex: 1, textAlign: 'center' }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bar: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md },
  side: { width: 40, justifyContent: 'center' },
  back: { fontSize: 36, fontWeight: '300', marginTop: -4 },
});
