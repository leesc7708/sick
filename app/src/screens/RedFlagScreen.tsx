import React, { useMemo, useState } from 'react';
import { Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { RED_FLAGS, evaluateRedFlags } from '../data/redFlags';
import { RedFlagItem, RedFlagResult, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RedFlag'>;

export function RedFlagScreen({ navigation }: Props) {
  const [sel, setSel] = useState<string[]>([]);
  const [result, setResult] = useState<RedFlagResult | null>(null);

  const workItems = useMemo(() => RED_FLAGS.filter((f) => f.group === 'work'), []);
  const generalItems = useMemo(() => RED_FLAGS.filter((f) => f.group === 'general'), []);

  const toggle = (id: string) => {
    setResult(null);
    setSel((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const call119 = () => Linking.openURL('tel:119');
  const findER = () => navigation.navigate('HospitalFinder', { kind: 'er' });
  const share = () => {
    const labels = RED_FLAGS.filter((f) => sel.includes(f.id)).map((f) => f.label).join(', ');
    Share.share({ message: `[라이프라인] 응급 상황 공유\n선택한 증상: ${labels || '없음'}\n위치를 확인하고 도와주세요.` });
  };

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
        <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{item.label}</Text>
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
            <PrimaryButton title="관리자·보호자에게 공유" variant="outline" onPress={share} style={{ marginTop: spacing.sm }} />
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
});
