import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { WORK_TYPES } from '../data/options';
import { RootStackParamList } from '../types';
import { storage } from '../services/storage';
import { useLang } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import { getMyMembership, reportUnfit, Membership } from '../services/crew';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkCheck'>;

const RISK_WORK = ['밀폐공간', '화학물질 취급', '고소작업'];
const WT_KEY: Record<string, string> = {
  '밀폐공간': 'wt_confined', '화학물질 취급': 'wt_chem', '고소작업': 'wt_height', '중장비': 'wt_heavy', '용접·화기': 'wt_weld', '일반작업': 'wt_general',
};

export function WorkCheckScreen({ navigation }: Props) {
  const { t } = useLang();
  const { account } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [workType, setWorkType] = useState(WORK_TYPES[0]);

  // 오늘 소속 크루 로드 → 부적합 시 관리자에게 서버 전송용
  useEffect(() => {
    if (account?.role === 'worker') {
      getMyMembership(account.uid).then(setMembership).catch(() => setMembership(null));
    }
  }, [account]);
  // 안전문항 3종: 기본값 미선택(null)으로 능동 응답 강제 (통과 프리셋 제거 — 묵인편향 방지)
  const [sleepOk, setSleepOk] = useState<boolean | null>(null);
  const [noAlcohol, setNoAlcohol] = useState<boolean | null>(null);
  const [noDizziness, setNoDizziness] = useState<boolean | null>(null);
  // 복약 문항: 극성이 모호(약 없음/깜빡/진정제 후 졸림)해 판정에 넣으면 오탐 → 참고 정보로만 저장, result 무반영
  const [tookMeds, setTookMeds] = useState<boolean | null>(null);

  const answered = sleepOk !== null && noAlcohol !== null && noDizziness !== null;
  const allGood = sleepOk === true && noAlcohol === true && noDizziness === true;
  const isRisk = RISK_WORK.includes(workType);
  // 3문항 전부 응답 후에만 판정. 위험작업+부적합=unfit(보류·보고) / 일반작업+부적합=caution / 그 외 ok
  const result: 'ok' | 'caution' | 'unfit' | null = !answered ? null : allGood ? 'ok' : isRisk ? 'unfit' : 'caution';
  const riskWarn = result === 'unfit';

  const Question = ({ label, value, set }: { label: string; value: boolean | null; set: (v: boolean) => void }) => (
    <View style={styles.q}>
      <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{label}</Text>
      <Chip label={t('wc_yes')} tone="primary" selected={value === true} onPress={() => set(true)} />
      <Chip label={t('wc_no')} tone="red" selected={value === false} onPress={() => set(false)} />
    </View>
  );

  const submit = async () => {
    if (!answered || !result) return; // 3문항 미응답 시 제출 불가(버튼도 disabled)
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
    // 위험작업 부적합(unfit)이고 오늘 소속 크루가 있으면 관리자에게 실제 서버 전송(로컬기록만이 아닌 실보고)
    let reported = false;
    if (result === 'unfit' && account && membership) {
      try { await reportUnfit(account, membership, workType); reported = true; } catch {}
    }
    const title = result === 'unfit' ? t('wc_unfit_t') : t('wc_submit');
    let msg = result === 'unfit' ? t('wc_unfit_m') : result === 'caution' ? t('wc_warn_m') : t('wc_note');
    if (result === 'unfit') msg += '\n\n' + (reported ? t('wc_reported') : t('wc_report_none'));
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

        {/* 적합성 판정 문항 (3종, 응답 필수) */}
        <View style={[styles.card, shadow.card]}>
          <Question label={t('wc_q_sleep')} value={sleepOk} set={setSleepOk} />
          <Question label={t('wc_q_alcohol')} value={noAlcohol} set={setNoAlcohol} />
          <Question label={t('wc_q_dizzy')} value={noDizziness} set={setNoDizziness} />
        </View>

        {/* 참고 정보 (복약) — 판정에 반영되지 않음, 사고 시 의료 맥락용으로만 기록 */}
        <Text style={[styles.label, { marginTop: spacing.md }]}>{t('wc_ref_t')}</Text>
        <View style={[styles.card, shadow.card, { marginTop: spacing.sm }]}>
          <Question label={t('wc_q_meds')} value={tookMeds} set={setTookMeds} />
          <Text style={[typography.small, { color: colors.textMuted, paddingHorizontal: 8, paddingBottom: 6 }]}>{t('wc_ref_m')}</Text>
        </View>

        {riskWarn && (
          <View style={[styles.unfit, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="alert" size={24} color={colors.emergency} />
              <Text style={[typography.h3, { color: colors.emergency, marginLeft: 8, flex: 1 }]}>{t('wc_unfit_t')}</Text>
            </View>
            <Text style={[typography.body, { color: colors.text, marginTop: 6 }]}>{t('wc_unfit_m')}</Text>
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
        {!answered && (
          <Text style={[typography.small, { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm }]}>{t('wc_answer_all')}</Text>
        )}
        <PrimaryButton
          title={result === 'unfit' ? t('wc_submit_unfit') : t('wc_submit')}
          icon={result === 'unfit' ? '⚠️' : '✅'}
          variant={result === 'unfit' ? 'emergency' : result === 'caution' ? 'work' : 'success'}
          size="lg"
          disabled={!answered}
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
  warn: { backgroundColor: colors.warningLight, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.warning },
  unfit: { backgroundColor: colors.emergencyLight, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.md, borderWidth: 1.5, borderColor: colors.emergency },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
});
