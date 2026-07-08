import React, { useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { activeScrollTop, fabStore } from '../utils/scrollTop';

// 우하단 "맨 위로" 버튼 — 충분히 스크롤한 화면에서만 노출(로그인·최상단에선 숨김)
export function ScrollTopFab() {
  const visible = useSyncExternalStore(fabStore.subscribe, fabStore.getSnapshot, () => false);
  if (!visible) return null;
  return (
    <Pressable
      onPress={() => activeScrollTop.current?.()}
      style={({ pressed }) => [styles.fab, pressed && { opacity: 0.65, transform: [{ scale: 0.94 }] }]}
    >
      <Text style={styles.arrow}>↑</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 88,
    right: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.g800,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 999,
    opacity: 0.92,
  },
  arrow: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: -2 },
});
