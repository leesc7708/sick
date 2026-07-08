import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { LogoMark } from '../components/LogoMark';
import { LangSwitcher } from '../components/LangSwitcher';
import { Icon } from '../components/Icon';
import { useLang } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';
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
  const { user, onboarded, markOnboarded } = useAuth();
  const [mode, setMode] = useState<AppMode | null>(null);
  const [ageBand, setAgeBand] = useState<string | null>(null);
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [meds, setMeds] = useState('');
  const [healthConsent, setHealthConsent] = useState(false);

  const enteredSensitive = !!(conditions.trim() || allergies.trim() || meds.trim());

  const start = async () => {
    // 민감정보(기저질환·알레르기·복용약)를 입력했는데 동의 안 했으면 저장하지 않고 안내
    if (enteredSensitive && !healthConsent) {
      Alert.alert(t('consent_h'), t('consent_required'));
      return;
    }
    await storage.setHealthConsent(healthConsent && enteredSensitive);
    await storage.setProfile({
      mode: mode ?? 'work',
      age: AGE_BANDS.find((b) => b.label === ageBand)?.value,
      // 미동의 시 민감정보는 저장하지 않음(빈 배열)
      conditions: healthConsent ? splitCsv(conditions) : [],
      allergies: healthConsent ? splitCsv(allergies) : [],
      currentMedicines: healthConsent ? splitCsv(meds) : [],
      onboardingDone: true,
    });
    // 계정별 온보딩 완료 기록 + 컨텍스트 즉시 반영
    const wasOnboarded = onboarded;
    if (user) await storage.setOnboarded(user.uid, true);
    markOnboarded();
    // 최초 온보딩: 축소 스택 → 전체 스택으로 스왑되며 RN이 Home(첫 화면)을 자동 표시(수동 이동 불필요)
    // 설정에서 재진입(이미 onboarded, 전체 스택): 명시적으로 Home으로 복귀
    if (wasOnboarded) navigation.replace('Home');
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
              <View style={styles.modeIcon}>
                <Icon name={m.key === 'work' ? 'vest' : 'user'} size={26} color={on ? colors.primary : colors.g600} />
              </View>
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

        {/* 민감정보(건강) 수집·이용 동의 — Play Store 필수 요건 / 개인정보보호법 */}
        <Pressable onPress={() => setHealthConsent((v) => !v)} style={[styles.consent, healthConsent && { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}>
          <View style={[styles.check, healthConsent && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            {healthConsent && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.captionBold, { color: colors.text }]}>{t('consent_agree')}</Text>
            <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>{t('consent_body')}</Text>
            <Pressable onPress={() => navigation.navigate('PrivacyPolicy')} hitSlop={6}>
              <Text style={[typography.small, { color: colors.primary, marginTop: 4, textDecorationLine: 'underline' }]}>{t('privacy_view')}</Text>
            </Pressable>
          </View>
        </Pressable>

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
  modeIcon: { width: 48, height: 48, borderRadius: radius.lg, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.g300, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, ...typography.body, color: colors.text },
  footer: { padding: spacing.lg, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.divider },
  consent: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, padding: spacing.md, marginTop: spacing.md },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.g300, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm, marginTop: 1 },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '800', lineHeight: 16 },
});
