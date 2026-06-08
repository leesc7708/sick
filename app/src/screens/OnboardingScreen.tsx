import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppMode, RootStackParamList } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const MODES: { key: AppMode; emoji: string; title: string; desc: string }[] = [
  { key: 'work', emoji: '🦺', title: '현장 모드', desc: '작업 전 체크 · 사고 보고 · 건강검진기록' },
  { key: 'general', emoji: '🙂', title: '일반 모드', desc: '증상 정리 · 병원 찾기 중심' },
];

export function OnboardingScreen({ navigation }: Props) {
  const [mode, setMode] = useState<AppMode | null>(null);

  const start = async () => {
    await storage.setProfile({
      mode: mode ?? 'work',
      conditions: [],
      allergies: [],
      currentMedicines: [],
      onboardingDone: true,
    });
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={[typography.display, { color: colors.text }]}>세이프콜</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          아플 때·다쳤을 때, 현장에서 가장 먼저
        </Text>

        <View style={{ marginTop: spacing.xl }}>
          {MODES.map((m) => {
            const on = mode === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMode(m.key)}
                style={[
                  styles.modeCard,
                  shadow.card,
                  on && { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primaryLight },
                ]}
              >
                <Text style={styles.modeEmoji}>{m.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h3, { color: colors.text }]}>{m.title}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>{m.desc}</Text>
                </View>
                <View style={[styles.radio, on && { borderColor: colors.primary }]}>
                  {on && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
        <Disclaimer compact />
      </View>

      <View style={styles.footer}>
        <PrimaryButton title="시작하기" size="lg" disabled={!mode} onPress={start} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: spacing.lg, paddingTop: spacing.xl },
  modeCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modeEmoji: { fontSize: 32, marginRight: spacing.md },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.g300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  footer: { padding: spacing.lg, paddingTop: spacing.sm },
});
