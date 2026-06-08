import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { INCIDENT_TYPES } from '../data/options';
import { firstAidFor } from '../data/firstAid';
import { IncidentType, RootStackParamList } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'IncidentReport'>;

export function IncidentReportScreen({ navigation }: Props) {
  const [type, setType] = useState<IncidentType | null>(null);
  const [memo, setMemo] = useState('');

  const card = type ? firstAidFor(type) : null;
  const call119 = () => Linking.openURL('tel:119');

  const report = async () => {
    if (!type) return;
    await storage.addIncident({
      id: `inc_${Date.now()}`,
      type,
      locationText: '현재 위치(GPS) 자동 첨부 — 데모',
      memo: memo.trim() || undefined,
      reportedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
    Alert.alert('보고 전송됨', '관리자·보호자에게 위치와 함께 전송되었습니다. (데모)', [
      { text: '응급실 찾기', onPress: () => navigation.navigate('HospitalFinder', { kind: 'er' }) },
      { text: '확인', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <AppBar title="사고·이상 보고" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>어떤 상황인가요?</Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: 6, marginBottom: spacing.md }]}>
          유형을 고르면 응급처치 안내와 가까운 응급실이 바로 나와요.
        </Text>

        <View style={styles.chips}>
          {INCIDENT_TYPES.map((t) => (
            <Chip key={t} label={t} tone="red" selected={type === t} onPress={() => setType(t as IncidentType)} />
          ))}
        </View>

        <View style={[styles.gps, shadow.card]}>
          <Text style={[typography.captionBold, { color: colors.text }]}>📍 현재 위치(GPS) 자동 첨부됨</Text>
          <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>실제 서비스에서는 좌표·주소가 함께 전송됩니다.</Text>
        </View>

        <TextInput
          value={memo}
          onChangeText={setMemo}
          placeholder="상황 메모(선택) — 예: A구역 맨홀 내부"
          placeholderTextColor={colors.g400}
          style={styles.input}
          multiline
        />

        {card && (
          <View style={[styles.aidCard, shadow.card]}>
            <Text style={[typography.h3, { color: colors.emergency }]}>🚑 {card.title} — 응급처치</Text>
            {card.steps.map((s, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.stepNo}><Text style={styles.stepNoTxt}>{i + 1}</Text></View>
                <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{s}</Text>
              </View>
            ))}
            <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.sm }]}>
              ※ 구조자 안전이 최우선입니다. 무리한 단독 구조는 2차 사고로 이어질 수 있습니다.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.rowBtns}>
          <View style={{ flex: 1 }}><PrimaryButton title="119 전화" icon="📞" variant="emergency" onPress={call119} /></View>
          <View style={{ width: spacing.sm }} />
          <View style={{ flex: 1 }}>
            <PrimaryButton title="응급실 찾기" icon="🏥" variant="primary" onPress={() => navigation.navigate('HospitalFinder', { kind: 'er' })} />
          </View>
        </View>
        <PrimaryButton title="보고 전송" icon="🚨" variant="work" size="lg" disabled={!type} onPress={report} style={{ marginTop: spacing.sm }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  gps: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 56,
    marginTop: spacing.sm,
    ...typography.body,
    color: colors.text,
  },
  aidCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md, borderWidth: 1.5, borderColor: '#FFD9D6' },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.sm },
  stepNo: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.emergency, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 },
  stepNoTxt: { color: '#fff', fontWeight: '800', fontSize: 12 },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.bg },
  rowBtns: { flexDirection: 'row' },
});
