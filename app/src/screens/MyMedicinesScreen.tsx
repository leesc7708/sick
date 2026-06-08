import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { MyMedicine, RootStackParamList } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'MyMedicines'>;

export function MyMedicinesScreen({ navigation }: Props) {
  const [list, setList] = useState<MyMedicine[]>([]);
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [allergies, setAllergies] = useState('');

  const reload = useCallback(async () => {
    setList(await storage.getMyMedicines());
    const p = await storage.getProfile();
    setAllergies((p?.allergies ?? []).join(', '));
  }, []);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const add = async () => {
    if (!name.trim()) return;
    await storage.addMyMedicine({ id: `med_${Date.now()}`, name: name.trim(), doseTime: time.trim() || undefined });
    setName('');
    setTime('');
    reload();
  };
  const remove = async (id: string) => { await storage.deleteMyMedicine(id); reload(); };
  const saveAllergies = async () => {
    const p = await storage.getProfile();
    if (!p) return;
    await storage.setProfile({ ...p, allergies: allergies.split(',').map((x) => x.trim()).filter(Boolean) });
    Alert.alert('저장됨', '알레르기 정보가 저장되었습니다.');
  };

  return (
    <View style={styles.wrap}>
      <AppBar title="내 복용약" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>처방·추천이 아니라 기록 도구예요. 병원·약국에서 보여주세요.</Text>

        {list.map((m) => (
          <View key={m.id} style={[styles.card, shadow.card]}>
            <Text style={{ fontSize: 20, marginRight: 10 }}>💊</Text>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyBold, { color: colors.text }]}>{m.name}</Text>
              {m.doseTime ? <Text style={[typography.caption, { color: colors.textMuted }]}>복용 {m.doseTime}</Text> : null}
            </View>
            <Text onPress={() => remove(m.id)} style={[typography.caption, { color: colors.emergency }]}>삭제</Text>
          </View>
        ))}

        <View style={[styles.addBox, shadow.card]}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>약 추가</Text>
          <TextInput value={name} onChangeText={setName} placeholder="약 이름 (예: 혈압약)" placeholderTextColor={colors.g400} style={styles.input} />
          <TextInput value={time} onChangeText={setTime} placeholder="복용 시간(선택) (예: 아침 08:00)" placeholderTextColor={colors.g400} style={[styles.input, { marginTop: spacing.sm }]} />
          <PrimaryButton title="추가" icon="＋" variant="primary" onPress={add} style={{ marginTop: spacing.sm }} />
        </View>

        <View style={[styles.addBox, shadow.card]}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>알레르기 메모</Text>
          <TextInput value={allergies} onChangeText={setAllergies} placeholder="예: 페니실린, 아스피린" placeholderTextColor={colors.g400} style={styles.input} />
          <PrimaryButton title="알레르기 저장" variant="outline" onPress={saveAllergies} style={{ marginTop: spacing.sm }} />
        </View>

        <View style={[styles.v15, shadow.card]}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>v1.5 예정</Text>
          <Text style={[typography.caption, { color: colors.text, marginTop: 4 }]}>식약처 e약은요로 효능·주의사항·상호작용을 조회합니다. (판정이 아닌 정보 제공, 약사 상담 안내)</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="병원·약국에 보여줄 목록" icon="🏥" variant="outline" onPress={() => navigation.navigate('HospitalFinder', { kind: 'pharmacy' })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center' },
  addBox: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.lg },
  input: { backgroundColor: colors.g50, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, ...typography.body, color: colors.text },
  v15: { backgroundColor: '#F4F9FF', borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg, borderWidth: 1, borderColor: '#D8E9FF' },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
});
