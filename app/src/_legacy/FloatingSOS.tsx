import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

// 전역 긴급 버튼 — 어느 화면에서나 우하단에 떠 있어 즉시 119 연결
export function FloatingSOS() {
  const onPress = () =>
    Alert.alert('긴급 상황', '119에 전화할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '📞 119 전화', style: 'destructive', onPress: () => Linking.openURL('tel:119') },
    ]);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.94 }] }]}>
      <Text style={styles.txt}>SOS</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 92,
    right: 18,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  txt: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
});
