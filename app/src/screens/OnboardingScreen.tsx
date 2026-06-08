import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Chip } from '../components/Chip';
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

const AGE_BANDS: { label: string; value: number }[] = [
  { label: '10대', value: 15 },
  { label: '20대', value: 25 },
  { label: '30대', value: 35 },
  { label: '40대', value: 45 },
  { label: '50대', value: 55 },
  { label: '60대+', value: 65 },
];

const splitCsv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

export function OnboardingScreen({ navigation }: Props) {
  const [mode, setMode] = useState<AppMode | null>(null);
  const [ageBand, setAgeBand] = useState<string | null>(null);
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [meds, setMeds] = useState('');

  const start = async () => {
    await storage.setProfile({
      mode: mode ?? 'work',
      age: AGE_BANDS.find((b) => b.label === ageBand)?.value,
      conditions: splitCsv(conditions),
      allergies: splitCsv(allergies),
      currentMedicines: splitCsv(meds),
      onboardingDone: true,
    });
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[typography.display, { color: colors.text }]}>세이프콜</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          아플 때·다쳤을 때, 현장에서 가장 먼저
        </Text>

        <Text style={styles.sectionLabel}>사용 환경을 선택하세요</Text>
        {MODES.map((m) => {
          const on = mode === m.key;
          return (
            <Pressable
              key={m.key}
              onPress={() => setMode(m.key)}
              style={[styles.modeCard, shadow.card, on && { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primaryLight }]}
            >
              <Text style={styles.modeEmoji}>{m.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[typography.h3, { color: colors.text }]}>{m.title}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>{m.desc}</Text>
              </View>
              <View style={[styles.radio, on && { borderColor: colors.primary }]}>{on && <View style={styles.radioDot} />}</View>
            </Pressable>
          );
        })}

        <Text style={styles.sectionLabel}>간단 프로필 <Text style={[typography.caption, { color: colors.textMuted }]}>(선택)</Text></Text>
        <Text style={styles.fieldLabel}>연령대</Text>
        <View style={styles.chips}>
          {AGE_BANDS.map((b) => <Chip key={b.label} label={b.label} selected={ageBand === b.label} onPress={() => setAgeBand(b.label)} />)}
        </View>
        <Text style={styles.fieldLabel}>기저질환 (쉼표로 구분)</Text>
        <TextInput value={conditions} onChangeText={setConditions} placeholder="예: 고혈압, 당뇨" placeholderTextColor={colors.g400} style={styles.input} />
        <Text style={styles.fieldLabel}>알레르기</Text>
        <TextInput value={allergies} onChangeText={setAllergies} placeholder="예: 페니실린" placeholderTextColor={colors.g400} style={styles.input} />
        <Text style={styles.fieldLabel}>복용 중인 약</Text>
        <TextInput value={meds} onChangeText={setMeds} placeholder="예: 혈압약" placeholderTextColor={colors.g400} style={styles.input} />

        <Disclaimer compact />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="시작하기" size="lg" disabled={!mode} onPress={start} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md },
  sectionLabel: { ...typography.h3, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  fieldLabel: { ...typography.captionBold, color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.sm },
  modeCard: { backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 2, borderColor: 'transparent', padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  modeEmoji: { fontSize: 32, marginRight: spacing.md },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.g300, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, ...typography.body, color: colors.text },
  footer: { padding: spacing.lg, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.divider },
});
