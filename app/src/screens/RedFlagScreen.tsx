import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { RED_FLAGS, evaluateRedFlags } from '../data/redFlags';
import { RedFlagItem, RedFlagResult, RootStackParamList, UserProfile } from '../types';
import { storage } from '../services/storage';
import { useLang } from '../i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'RedFlag'>;

const FIRST_STEPS = [
  '환자 곁에 있어 주세요. 의식과 호흡을 확인하세요.',
  '함부로 옮기지 마세요(척추·2차 사고 위험). 밀폐공간·가스면 구조자 안전이 먼저입니다.',
  '의식이 없고 숨을 안 쉬면 119 안내에 따라 심폐소생술을 하세요.',
  '출입구·위치를 구급대에 안내하고, 주변에 도움을 요청하세요.',
];

export function RedFlagScreen({ navigation }: Props) {
  const [sel, setSel] = useState<string[]>([]);
  const [result, setResult] = useState<RedFlagResult | null>(null);
  const { lang } = useLang();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  useEffect(() => { storage.getProfile().then(setProfile); }, []);

  const workItems = useMemo(() => RED_FLAGS.filter((f) => f.group === 'work'), []);
  const generalItems = useMemo(() => RED_FLAGS.filter((f) => f.group === 'general'), []);

  const toggle = (id: string) => {
    setResult(null);
    setSel((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const call119 = () => Linking.openURL('tel:119');
  const findER = () => navigation.navigate('HospitalFinder', { kind: 'er' });
  const share = () => {
    const labels = RED_FLAGS.filter((f) => sel.includes(f.id)).map((f) => f.label[lang]).join(', ');
    const cond = (profile?.conditions ?? []).join(', ') || '없음';
    const meds = (profile?.currentMedicines ?? []).join(', ') || '없음';
    const alg = (profile?.allergies ?? []).join(', ') || '없음';
    Share.share({
      message: `[라이프라인] 🆘 응급 상황\n선택 증상: ${labels || '없음'}\n기저질환: ${cond}\n복용약: ${meds}\n알레르기: ${alg}\n위치: 현재 위치(GPS) 확인 요망\n→ 즉시 와서 도와주세요. 119와 연계하세요.`,
    });
  };

  const Info = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={[typography.caption, { color: colors.textMuted, width: 78 }]}>{label}</Text>
      <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{value}</Text>
    </View>
  );

  const toneColor =
    result?.level === 'red' ? colors.emergency : result?.level === 'yellow' ? colors.warning : colors.g500;
  const toneBg = result?.level === 'red' ? '#FFF5F5' : result?.level === 'yellow' ? '#FFFAEC' : colors.g50;

  const Row = ({ item }: { item: RedFlagItem }) => {
    const on = sel.includes(item.id);
    return (
      <Pressable
        onPress={() => toggle(item.id)}
        style={[styles.row, on && { borderColor: colors.emergency, backgroundColor: '#FFF5F5' }]}
      >
        <View style={[styles.box, on && { backgroundColor: colors.emergency, borderColor: colors.emergency }]}>
          {on && <Text style={styles.check}>✓</Text>}
        </View>
        <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{item.label[lang]}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.wrap}>
      <AppBar title="응급 신호 확인" emergency onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>지금 해당하는 것을{'\n'}모두 선택하세요</Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: 6 }]}>
          규칙 기반으로 안내합니다. 진단이 아니며, 애매하면 119에 문의하세요.
        </Text>

        <Text style={styles.sectionLabel}>🦺 산업현장</Text>
        {workItems.map((item) => <Row key={item.id} item={item} />)}

        <Text style={styles.sectionLabel}>🩺 일반</Text>
        {generalItems.map((item) => <Row key={item.id} item={item} />)}

        {result && (
          <View style={[styles.resultCard, shadow.card, { backgroundColor: toneBg, borderColor: toneColor }]}>
            <Text style={[typography.h3, { color: toneColor }]}>
              {result.level === 'red' ? '🔴 ' : result.level === 'yellow' ? '🟡 ' : '⚪ '}
              {result.title}
            </Text>
            <Text style={[typography.body, { color: colors.text, marginTop: 6 }]}>{result.message}</Text>
          </View>
        )}

        {result?.level === 'red' && (
          <>
            <View style={[styles.infoCard, shadow.card]}>
              <Text style={[typography.h3, { color: colors.emergency }]}>🆘 구조대·병원에 보여주세요</Text>
              <Text style={[typography.small, { color: colors.textMuted, marginTop: 2, marginBottom: spacing.sm }]}>
                말로 설명하기 어렵거나 한국어가 통하지 않을 때, 이 화면을 그대로 제시하세요.
              </Text>
              <Info label="📍 위치" value="현재 위치(GPS) 자동 — 데모" />
              <Info label="🩹 증상" value={RED_FLAGS.filter((f) => sel.includes(f.id)).map((f) => f.label[lang]).join(', ') || '선택 없음'} />
              <Info label="💊 기저질환" value={(profile?.conditions ?? []).join(', ') || '없음/미입력'} />
              <Info label="💊 복용약" value={(profile?.currentMedicines ?? []).join(', ') || '없음/미입력'} />
              <Info label="⚠️ 알레르기" value={(profile?.allergies ?? []).join(', ') || '없음/미입력'} />
            </View>
            <View style={[styles.aidCard, shadow.card]}>
              <Text style={[typography.h3, { color: colors.text }]}>🧰 구급대 오기 전 대처</Text>
              {FIRST_STEPS.map((s, i) => (
                <View key={i} style={styles.aidRow}>
                  <Text style={styles.aidDot}>•</Text>
                  <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{s}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!result ? (
          <PrimaryButton title="결과 확인" variant="emergency" size="lg" disabled={!sel.length} onPress={() => setResult(evaluateRedFlags(sel))} />
        ) : result.level === 'red' ? (
          <>
            <View style={styles.rowBtns}>
              <View style={{ flex: 1 }}><PrimaryButton title="119 전화" icon="📞" variant="emergency" onPress={call119} /></View>
              <View style={{ width: spacing.sm }} />
              <View style={{ flex: 1 }}><PrimaryButton title="응급실 찾기" icon="🏥" variant="primary" onPress={findER} /></View>
            </View>
            <PrimaryButton title="🆘 관리자·보호자에게 정보 전송" variant="work" onPress={share} style={{ marginTop: spacing.sm }} />
          </>
        ) : result.level === 'yellow' ? (
          <>
            <PrimaryButton title="병원·약국 찾기" icon="🏥" variant="primary" onPress={() => navigation.navigate('HospitalFinder')} />
            <PrimaryButton title="증상 정리하기" variant="outline" onPress={() => navigation.navigate('SymptomInput')} style={{ marginTop: spacing.sm }} />
          </>
        ) : (
          <>
            <PrimaryButton title="증상 정리하기" icon="📝" variant="primary" onPress={() => navigation.navigate('SymptomInput')} />
            <PrimaryButton title="홈으로" variant="ghost" onPress={() => navigation.navigate('Home')} style={{ marginTop: spacing.sm }} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  sectionLabel: { ...typography.captionBold, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: spacing.sm,
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.g300,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#fff', fontWeight: '900', fontSize: 16 },
  resultCard: { borderWidth: 1.5, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.lg },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.bg,
  },
  rowBtns: { flexDirection: 'row' },
  infoCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md, borderWidth: 1.5, borderColor: '#FFD9D6' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.divider },
  aidCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md },
  aidRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  aidDot: { color: colors.emergency, fontSize: 16, fontWeight: '900', marginRight: 8, lineHeight: 22 },
});
