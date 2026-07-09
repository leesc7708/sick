import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors as _staticColors, radius, spacing, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { RED_FLAGS, evaluateRedFlags } from '../data/redFlags';
import { RedFlagItem, RedFlagResult, RootStackParamList, UserProfile } from '../types';
import { storage } from '../services/storage';
import { useLang } from '../i18n/LanguageContext';
import { Lang } from '../i18n/translations';

type Props = NativeStackScreenProps<RootStackParamList, 'RedFlag'>;

const FIRST_STEPS: Record<Lang, string[]> = {
  ko: [
    '환자 곁에 있어 주세요. 의식과 호흡을 확인하세요.',
    '함부로 옮기지 마세요(척추·2차 사고 위험). 밀폐공간·가스면 구조자 안전이 먼저입니다.',
    '의식이 없고 숨을 안 쉬면 119 안내에 따라 심폐소생술을 하세요.',
    '출입구·위치를 구급대에 안내하고, 주변에 도움을 요청하세요.',
  ],
  en: [
    'Stay with the patient. Check consciousness and breathing.',
    'Do not move them carelessly (spine/secondary accident). In a confined space/gas, rescuer safety first.',
    'If unconscious and not breathing, perform CPR following 119 guidance.',
    'Guide responders to the entrance/location and ask others for help.',
  ],
  zh: [
    '留在患者身边，检查意识和呼吸。',
    '不要随意移动（脊椎/二次事故风险）。密闭空间/气体时，救援者安全优先。',
    '若无意识且无呼吸，按119指导进行心肺复苏。',
    '引导救援队到入口/位置，并向周围求助。',
  ],
  ja: [
    '患者のそばにいて、意識と呼吸を確認してください。',
    'むやみに動かさないで（脊椎・二次事故の危険）。密閉空間・ガスは救助者の安全優先。',
    '意識がなく呼吸がなければ119の案内に従い心肺蘇生を。',
    '出入口・位置を救急隊に案内し、周囲に助けを求めてください。',
  ],
  vi: [
    'Ở bên bệnh nhân. Kiểm tra ý thức và hô hấp.',
    'Đừng di chuyển tùy tiện (nguy cơ cột sống/tai nạn thứ cấp). Trong không gian kín/khí, an toàn người cứu trước.',
    'Nếu bất tỉnh và ngừng thở, thực hiện CPR theo hướng dẫn 119.',
    'Hướng dẫn đội cứu hộ đến lối vào/vị trí và nhờ người xung quanh giúp.',
  ],
  th: [
    'อยู่กับผู้ป่วย ตรวจสติและการหายใจ',
    'อย่าเคลื่อนย้ายพร่ำเพรื่อ (เสี่ยงกระดูกสันหลัง/อุบัติเหตุซ้ำ) ในที่อับอากาศ/แก๊ส ความปลอดภัยผู้ช่วยมาก่อน',
    'หากหมดสติและไม่หายใจ ทำ CPR ตามคำแนะนำ 119',
    'นำทางหน่วยกู้ภัยไปทางเข้า/ตำแหน่ง และขอความช่วยเหลือจากคนรอบข้าง',
  ],
  es: [
    'Quédese con el paciente. Verifique conciencia y respiración.',
    'No lo mueva sin cuidado (riesgo de columna/accidente secundario). En espacio confinado/gas, primero la seguridad del rescatista.',
    'Si está inconsciente y no respira, haga RCP siguiendo la guía del 119.',
    'Guíe a los rescatistas a la entrada/ubicación y pida ayuda a los demás.',
  ],
};

export function RedFlagScreen({ navigation }: Props) {
  const colors = useTheme(); // JSX의 colors.* 를 활성 테마로 (StyleSheet 색은 사용처에서 덮음)
  const [sel, setSel] = useState<string[]>([]);
  const [result, setResult] = useState<RedFlagResult | null>(null);
  const { lang, t } = useLang();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  useEffect(() => { storage.getProfile().then(setProfile); }, []);

  const workItems = useMemo(() => RED_FLAGS.filter((f) => f.group === 'work'), []);
  const generalItems = useMemo(() => RED_FLAGS.filter((f) => f.group === 'general'), []);

  const toggle = (id: string) => {
    setResult(null);
    setSel((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };
  const selectedSymptoms = () => RED_FLAGS.filter((f) => sel.includes(f.id)).map((f) => f.label[lang]).join(', ');

  const call119 = () => Linking.openURL('tel:119');
  const findER = () => navigation.navigate('HospitalFinder', { kind: 'er' });
  const share = () => {
    const cond = (profile?.conditions ?? []).join(', ') || '-';
    const meds = (profile?.currentMedicines ?? []).join(', ') || '-';
    const alg = (profile?.allergies ?? []).join(', ') || '-';
    Share.share({
      message: `[Lifeline] 🆘\n${t('ef_symptom')}: ${selectedSymptoms() || '-'}\n${t('ef_cond')}: ${cond}\n${t('ef_meds')}: ${meds}\n${t('ef_alg')}: ${alg}\n${t('ef_loc')}: GPS\n→ 119`,
    });
  };

  const Info = ({ label, value }: { label: string; value: string }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
      <Text style={[typography.caption, { color: colors.textMuted, width: 96 }]}>{label}</Text>
      <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{value}</Text>
    </View>
  );

  const toneColor =
    result?.level === 'red' ? colors.emergency : result?.level === 'yellow' ? colors.warning : colors.g500;
  const toneBg = result?.level === 'red' ? colors.emergencyLight : result?.level === 'yellow' ? colors.warningLight : colors.g50;

  const Row = ({ item }: { item: RedFlagItem }) => {
    const on = sel.includes(item.id);
    return (
      <Pressable
        onPress={() => toggle(item.id)}
        style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }, on && { borderColor: colors.emergency, backgroundColor: colors.emergencyLight }]}
      >
        <View style={[styles.box, { borderColor: colors.g300 }, on && { backgroundColor: colors.emergency, borderColor: colors.emergency }]}>
          {on && <Text style={styles.check}>✓</Text>}
        </View>
        <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{item.label[lang]}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title={t('ef_title')} emergency onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>{t('ef_select')}</Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: 6 }]}>{t('ef_note')}</Text>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('ef_sec_work')}</Text>
        {workItems.map((item) => <Row key={item.id} item={item} />)}

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('ef_sec_general')}</Text>
        {generalItems.map((item) => <Row key={item.id} item={item} />)}

        {result && (
          <View style={[styles.resultCard, shadow.card, { backgroundColor: toneBg, borderColor: toneColor }]}>
            <Text style={[typography.h3, { color: toneColor }]}>
              {result.level === 'red' ? '🔴 ' : result.level === 'yellow' ? '🟡 ' : '⚪ '}
              {t(`ef_${result.level}_t`)}
            </Text>
            <Text style={[typography.body, { color: colors.text, marginTop: 6 }]}>{t(`ef_${result.level}_m`)}</Text>
          </View>
        )}

        {result?.level === 'red' && (
          <>
            <View style={[styles.infoCard, shadow.card, { backgroundColor: colors.card, borderColor: colors.emergency }]}>
              <Text style={[typography.h3, { color: colors.emergency }]}>{t('ef_show_title')}</Text>
              <Text style={[typography.small, { color: colors.textMuted, marginTop: 2, marginBottom: spacing.sm }]}>{t('ef_show_note')}</Text>
              <Info label={t('ef_loc')} value="GPS (demo)" />
              <Info label={t('ef_symptom')} value={selectedSymptoms() || '-'} />
              <Info label={t('ef_cond')} value={(profile?.conditions ?? []).join(', ') || '-'} />
              <Info label={t('ef_meds')} value={(profile?.currentMedicines ?? []).join(', ') || '-'} />
              <Info label={t('ef_alg')} value={(profile?.allergies ?? []).join(', ') || '-'} />
            </View>
            <View style={[styles.aidCard, shadow.card, { backgroundColor: colors.card }]}>
              <Text style={[typography.h3, { color: colors.text }]}>{t('ef_first_title')}</Text>
              {FIRST_STEPS[lang].map((s, i) => (
                <View key={i} style={styles.aidRow}>
                  <Text style={[styles.aidDot, { color: colors.emergency }]}>•</Text>
                  <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{s}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.divider, backgroundColor: colors.bg }]}>
        {!result ? (
          <PrimaryButton title={t('ef_result_check')} variant="emergency" size="lg" disabled={!sel.length} onPress={() => setResult(evaluateRedFlags(sel))} />
        ) : result.level === 'red' ? (
          <>
            <View style={styles.rowBtns}>
              <View style={{ flex: 1 }}><PrimaryButton title={t('ef_call119')} icon="📞" variant="emergency" onPress={call119} /></View>
              <View style={{ width: spacing.sm }} />
              <View style={{ flex: 1 }}><PrimaryButton title={t('ef_find_er')} icon="🏥" variant="primary" onPress={findER} /></View>
            </View>
            <PrimaryButton title={t('ef_send_info')} variant="work" onPress={share} style={{ marginTop: spacing.sm }} />
            {/* 심정지 대응: 가까운 AED + 다국어 사용법 (2026-07-09) */}
            <PrimaryButton title={t('aed_title')} icon="🫀" variant="outline" onPress={() => navigation.navigate('AedFinder')} style={{ marginTop: spacing.sm }} />
          </>
        ) : result.level === 'yellow' ? (
          <>
            <PrimaryButton title={t('ef_find_hospital')} icon="🏥" variant="primary" onPress={() => navigation.navigate('HospitalFinder')} />
            <PrimaryButton title={t('ef_organize')} variant="outline" onPress={() => navigation.navigate('SymptomInput')} style={{ marginTop: spacing.sm }} />
          </>
        ) : (
          <>
            <PrimaryButton title={t('ef_organize')} icon="📝" variant="primary" onPress={() => navigation.navigate('SymptomInput')} />
            <PrimaryButton title={t('ef_home')} variant="ghost" onPress={() => navigation.navigate('Home')} style={{ marginTop: spacing.sm }} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 색은 렌더 시 useTheme()로 덮음 — 여기 값은 정적 기본(라이트)일 뿐
  wrap: { flex: 1, backgroundColor: _staticColors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  sectionLabel: { ...typography.captionBold, color: _staticColors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: _staticColors.card,
    borderWidth: 1.5,
    borderColor: _staticColors.border,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: spacing.sm,
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: _staticColors.g300,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#fff', fontWeight: '900', fontSize: 16 },
  resultCard: { borderWidth: 1.5, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.lg },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: _staticColors.divider,
    backgroundColor: _staticColors.bg,
  },
  rowBtns: { flexDirection: 'row' },
  infoCard: { backgroundColor: _staticColors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md, borderWidth: 1.5, borderColor: _staticColors.emergency },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: _staticColors.divider },
  aidCard: { backgroundColor: _staticColors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md },
  aidRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  aidDot: { color: _staticColors.emergency, fontSize: 16, fontWeight: '900', marginRight: 8, lineHeight: 22 },
});
