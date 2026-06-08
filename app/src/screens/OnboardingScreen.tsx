import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { LogoMark } from '../components/LogoMark';
import { LangSwitcher } from '../components/LangSwitcher';
import { useLang } from '../i18n/LanguageContext';
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
  const { t } = useLang();
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
        <Text style={[typography.captionBold, { color: colors.textMuted, marginBottom: spacing.xs }]}>{t('lang_select')}</Text>
        <LangSwitcher style={{ marginBottom: spacing.lg }} />
        <LogoMark size={52} />
        <Text style={[typography.display, { color: colors.text, marginTop: spacing.sm }]}>라이프라인</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          {t('tagline_work')}
        </Text>

        <Text style={styles.sectionLabel}>{t('choose_mode')}</Text>
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
                <Text style={[typography.h3, { color: colors.text }]}>{t(m.key === 'work' ? 'mode_work' : 'mode_general')}</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>{t(m.key === 'work' ? 'mode_work_desc' : 'mode_general_desc')}</Text>
              </View>
              <View style={[styles.radio, on && { borderColor: colors.primary }]}>{on && <View style={styles.radioDot} />}</View>
            </Pressable>
          );
        })}

        <Text style={styles.sectionLabel}>{t('profile_optional')}</Text>
        <Text style={styles.fieldLabel}>{t('age_band')}</Text>
        <View style={styles.chips}>
          {AGE_BANDS.map((b) => <Chip key={b.label} label={b.label} selected={ageBand === b.label} onPress={() => setAgeBand(b.label)} />)}
        </View>
        <Text style={styles.fieldLabel}>{t('conditions')}</Text>
        <TextInput value={conditions} onChangeText={setConditions} placeholder={t('ob_cond_ph')} placeholderTextColor={colors.g400} style={styles.input} />
        <Text style={styles.fieldLabel}>{t('allergies')}</Text>
        <TextInput value={allergies} onChangeText={setAllergies} placeholder={t('ob_alg_ph')} placeholderTextColor={colors.g400} style={styles.input} />
        <Text style={styles.fieldLabel}>{t('current_meds')}</Text>
        <TextInput value={meds} onChangeText={setMeds} placeholder={t('ob_meds_ph')} placeholderTextColor={colors.g400} style={styles.input} />

        <Disclaimer compact text={t('disclaimer')} />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title={t('start')} size="lg" disabled={!mode} onPress={start} />
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
