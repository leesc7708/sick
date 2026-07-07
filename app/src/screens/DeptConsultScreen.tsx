import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { DEPT_GUIDES } from '../data/departmentGuide';
import { consultRuleBased, ConsultResult } from '../services/deptConsult';
import { RootStackParamList } from '../types';
import { useLang } from '../i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'DeptConsult'>;

// 자주 헷갈리는 케이스를 빠른 선택칩으로 (id는 departmentGuide와 일치)
const QUICK = ['stye', 'hand_numb', 'dizzy', 'rash', 'weld_eye', 'burn', 'chem_eye', 'dust_breath'];

const URGENCY_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  emergency: { bg: '#FDECEC', fg: colors.emergency, label: '🔴 응급 — 지체 말고 119/응급실' },
  soon: { bg: '#FFF4E5', fg: colors.warning, label: '🟠 되도록 빨리 진료' },
  normal: { bg: '#EAF5EE', fg: colors.success, label: '🟢 서두르지 않아도 되나 진료 권장' },
};

export function DeptConsultScreen({ navigation }: Props) {
  const { t } = useLang();
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [results, setResults] = useState<ConsultResult[] | null>(null);

  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const run = () => setResults(consultRuleBased(text, picked));

  const goHospital = (dept: string) =>
    navigation.navigate('HospitalFinder', { kind: 'hospital', department: dept });

  const quickGuides = QUICK.map((id) => DEPT_GUIDES.find((g) => g.id === id)).filter(Boolean) as typeof DEPT_GUIDES;

  return (
    <View style={styles.wrap}>
      <AppBar title={t('dc_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>{t('dc_lead')}</Text>

        <Text style={styles.label}>{t('dc_input_label')}</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t('dc_input_ph')}
          placeholderTextColor={colors.g400}
          style={[styles.input, { minHeight: 64 }]}
          multiline
        />

        <Text style={styles.label}>{t('dc_quick_label')}</Text>
        <View style={styles.chips}>
          {quickGuides.map((g) => (
            <Chip key={g.id} label={g.symptom} tone={g.work ? 'work' : 'primary'} selected={picked.includes(g.id)} onPress={() => togglePick(g.id)} />
          ))}
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <PrimaryButton title={t('dc_run')} icon="🔎" size="lg" onPress={run} />
        </View>

        {results && results.length === 0 && (
          <View style={[styles.card, shadow.card, { marginTop: spacing.lg }]}>
            <Text style={[typography.bodyBold, { color: colors.text }]}>{t('dc_none_title')}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 6 }]}>{t('dc_none_desc')}</Text>
            <View style={{ marginTop: spacing.md }}>
              <PrimaryButton title={t('dc_open_hospital')} icon="🏥" variant="outline" size="sm" onPress={() => navigation.navigate('HospitalFinder')} />
            </View>
          </View>
        )}

        {results && results.length > 0 && (
          <>
            <Text style={[styles.label, { marginTop: spacing.xl }]}>{t('dc_result_label')}</Text>
            {results.map(({ guide }, idx) => {
              const u = URGENCY_STYLE[guide.urgency];
              return (
                <View key={guide.id} style={[styles.card, shadow.card, { borderLeftWidth: 5, borderLeftColor: u.fg }]}>
                  {idx === 0 && <Text style={[typography.small, { color: colors.primary, marginBottom: 4 }]}>{t('dc_best')}</Text>}
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{guide.symptom}</Text>

                  <View style={styles.deptRow}>
                    <View style={styles.deptBadge}><Text style={styles.deptBadgeTxt}>{guide.primaryDept}</Text></View>
                    {guide.altDept && (
                      <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 8 }]}>
                        {t('dc_or')} {guide.altDept}
                      </Text>
                    )}
                  </View>

                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 8 }]}>{guide.reason}</Text>
                  {guide.confuseNote && (
                    <View style={styles.tipBox}>
                      <Text style={[typography.caption, { color: colors.g800 }]}>💡 {guide.confuseNote}</Text>
                    </View>
                  )}

                  <View style={[styles.urgency, { backgroundColor: u.bg }]}>
                    <Text style={[typography.captionBold, { color: u.fg }]}>{u.label}</Text>
                    {guide.urgencyNote && <Text style={[typography.small, { color: u.fg, marginTop: 2 }]}>{guide.urgencyNote}</Text>}
                  </View>

                  <View style={{ marginTop: spacing.md }}>
                    <PrimaryButton title={`${guide.primaryDept} ${t('dc_find_dept')}`} icon="🏥" size="sm" onPress={() => goHospital(guide.primaryDept)} />
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* 정직 고지: 지금은 규칙기반, AI 자유상담은 준비 중 */}
        <View style={[styles.aiNote]}>
          <Text style={[typography.small, { color: colors.textMuted }]}>{t('dc_ai_note')}</Text>
        </View>

        <Disclaimer text={t('dc_disclaimer')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  label: { ...typography.captionBold, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, ...typography.body, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm },
  deptRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  deptBadge: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 },
  deptBadgeTxt: { ...typography.captionBold, color: colors.textInverse },
  tipBox: { backgroundColor: colors.g100, borderRadius: radius.lg, padding: spacing.sm, marginTop: spacing.sm },
  urgency: { borderRadius: radius.lg, padding: spacing.sm, marginTop: spacing.sm },
  aiNote: { backgroundColor: colors.g50, borderRadius: radius.lg, padding: spacing.sm, marginTop: spacing.lg },
});
