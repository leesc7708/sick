import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { WORK_TYPES } from '../data/options';
import { RootStackParamList } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkCheck'>;

const RISK_WORK = ['밀폐공간', '화학물질 취급', '고소작업'];

export function WorkCheckScreen({ navigation }: Props) {
  const [workType, setWorkType] = useState(WORK_TYPES[0]);
  const [sleepOk, setSleepOk] = useState(true);
  const [noAlcohol, setNoAlcohol] = useState(true);
  const [tookMeds, setTookMeds] = useState(true);
  const [noDizziness, setNoDizziness] = useState(true);

  const allGood = sleepOk && noAlcohol && noDizziness;
  const riskWarn = RISK_WORK.includes(workType) && !allGood;

  const Question = ({ label, value, set }: { label: string; value: boolean; set: (v: boolean) => void }) => (
    <View style={styles.q}>
      <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{label}</Text>
      <Chip label="예" tone="primary" selected={value} onPress={() => set(true)} />
      <Chip label="아니오" tone="red" selected={!value} onPress={() => set(false)} />
    </View>
  );

  const submit = async () => {
    await storage.addWorkCheck({
      id: `wc_${Date.now()}`,
      workType,
      sleepOk,
      noAlcohol,
      tookMeds,
      noDizziness,
      completedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
    Alert.alert('체크 완료', riskWarn ? '위험작업 컨디션 주의 항목이 있어 관리자에게 전달됩니다. (데모)' : '관리자에게 전송되었습니다. (데모)', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <AppBar title="작업 전 건강체크" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>오늘 작업 전 체크</Text>
        <Text style={styles.label}>작업 종류</Text>
        <View style={styles.chips}>
          {WORK_TYPES.map((w) => <Chip key={w} label={w} tone="work" selected={workType === w} onPress={() => setWorkType(w)} />)}
        </View>

        <View style={[styles.card, shadow.card]}>
          <Question label="수면을 6시간 이상 잤나요?" value={sleepOk} set={setSleepOk} />
          <Question label="전날 음주를 안 했나요?" value={noAlcohol} set={setNoAlcohol} />
          <Question label="필요한 약을 복용했나요?" value={tookMeds} set={setTookMeds} />
          <Question label="어지럼·심한 피로가 없나요?" value={noDizziness} set={setNoDizziness} />
        </View>

        {riskWarn && (
          <View style={[styles.warn, shadow.card]}>
            <Text style={[typography.bodyBold, { color: colors.warning }]}>⚠️ 위험작업 컨디션 주의</Text>
            <Text style={[typography.caption, { color: colors.text, marginTop: 4 }]}>
              밀폐공간·화학물질·고소작업은 컨디션이 중요합니다. 관리자 확인 후 작업하세요.
            </Text>
          </View>
        )}

        <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.md }]}>
          ※ 진단이 아닌 자가 점검 도구입니다. 결과는 동의에 따라 관리자에게 공유됩니다.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="체크 완료 → 관리자 전송" icon="✅" variant={riskWarn ? 'work' : 'success'} size="lg" onPress={submit} />
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
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
});
