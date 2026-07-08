import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { WORK_TYPES } from '../data/options';
import { RootStackParamList } from '../types';
import { storage } from '../services/storage';
import { useLang } from '../i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkCheck'>;

const RISK_WORK = ['밀폐공간', '화학물질 취급', '고소작업'];
const WT_KEY: Record<string, string> = {
  '밀폐공간': 'wt_confined', '화학물질 취급': 'wt_chem', '고소작업': 'wt_height', '중장비': 'wt_heavy', '용접·화기': 'wt_weld', '일반작업': 'wt_general',
};

export function WorkCheckScreen({ navigation }: Props) {
  const { t } = useLang();
  const [workType, setWorkType] = useState(WORK_TYPES[0]);
  const [sleepOk, setSleepOk] = useState(true);
  const [noAlcohol, setNoAlcohol] = useState(true);
  const [tookMeds, setTookMeds] = useState(true);
  const [noDizziness, setNoDizziness] = useState(true);

  const allGood = sleepOk && noAlcohol && noDizziness;
  const isRisk = RISK_WORK.includes(workType);
  // 위험작업 + 부적합 = unfit(작업 보류·보고 권고) / 일반작업 + 부적합 = caution / 그 외 = ok
  const result: 'ok' | 'caution' | 'unfit' = allGood ? 'ok' : isRisk ? 'unfit' : 'caution';
  const riskWarn = result === 'unfit'; // 기존 경고 배너 유지(위험작업 부적합 시)

  const Question = ({ label, value, set }: { label: string; value: boolean; set: (v: boolean) => void }) => (
    <View style={styles.q}>
      <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{label}</Text>
      <Chip label={t('wc_yes')} tone="primary" selected={value} onPress={() => set(true)} />
      <Chip label={t('wc_no')} tone="red" selected={!value} onPress={() => set(false)} />
    </View>
  );

  const submit = async () => {
    // 부적합도 '작업 완료'가 아니라 결과(result)를 정직하게 기록 —
    // 위험작업 부적합(unfit)은 advisedStop=true로 "보류·보고 권고"를 남겨 중처법상 '알고도 투입' 오해 방지
    await storage.addWorkCheck({
      id: `wc_${Date.now()}`,
      workType,
      sleepOk,
      noAlcohol,
      tookMeds,
      noDizziness,
      completedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      result,
      advisedStop: result === 'unfit',
    });
    const title = result === 'unfit' ? t('wc_unfit_t') : t('wc_submit');
    const msg = result === 'unfit' ? t('wc_unfit_m') : result === 'caution' ? t('wc_warn_m') : t('wc_note');
    Alert.alert(title, msg, [
      { text: t('ef_home'), onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <AppBar title={t('wc_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>{t('wc_today')}</Text>
        <Text style={styles.label}>{t('wc_work_type')}</Text>
        <View style={styles.chips}>
          {WORK_TYPES.map((w) => <Chip key={w} label={t(WT_KEY[w])} tone="work" selected={workType === w} onPress={() => setWorkType(w)} />)}
        </View>

        <View style={[styles.card, shadow.card]}>
          <Question label={t('wc_q_sleep')} value={sleepOk} set={setSleepOk} />
          <Question label={t('wc_q_alcohol')} value={noAlcohol} set={setNoAlcohol} />
          <Question label={t('wc_q_meds')} value={tookMeds} set={setTookMeds} />
          <Question label={t('wc_q_dizzy')} value={noDizziness} set={setNoDizziness} />
        </View>

        {riskWarn && (
          <View style={[styles.unfit, shadow.card]}>
            <Text style={[typography.bodyBold, { color: colors.emergency }]}>{t('wc_unfit_t')}</Text>
            <Text style={[typography.caption, { color: colors.text, marginTop: 4 }]}>{t('wc_unfit_m')}</Text>
          </View>
        )}
        {result === 'caution' && (
          <View style={[styles.warn, shadow.card]}>
            <Text style={[typography.bodyBold, { color: colors.warning }]}>{t('wc_warn_t')}</Text>
            <Text style={[typography.caption, { color: colors.text, marginTop: 4 }]}>{t('wc_warn_m')}</Text>
          </View>
        )}

        <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.md }]}>{t('wc_note')}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={result === 'unfit' ? t('wc_submit_unfit') : t('wc_submit')}
          icon={result === 'unfit' ? '⚠️' : '✅'}
          variant={result === 'unfit' ? 'emergency' : result === 'caution' ? 'work' : 'success'}
          size="lg"
          onPress={submit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  label: { ...typography.captionBold, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.sm, marginTop: spacing.md },
  q: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8 },
  warn: { backgroundColor: '#FFFAEC', borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: '#FFE6A8' },
  unfit: { backgroundColor: '#FFF0EF', borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.md, borderWidth: 1.5, borderColor: '#F5B5B0' },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
});
