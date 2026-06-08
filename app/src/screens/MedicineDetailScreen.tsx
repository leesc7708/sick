import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types';
import { findMedicine } from '../data/mockMedicines';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'MedicineDetail'>;

export function MedicineDetailScreen({ route, navigation }: Props) {
  const { medicineId } = route.params;
  const medicine = findMedicine(medicineId);
  const [inMyList, setInMyList] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await storage.getMyMedicines();
      setInMyList(list.includes(medicineId));
    })();
  }, [medicineId]);

  if (!medicine) {
    return (
      <Screen>
        <Text style={[typography.body, { color: colors.text }]}>약품 정보를 찾을 수 없습니다.</Text>
      </Screen>
    );
  }

  async function toggle() {
    const list = await storage.getMyMedicines();
    let next: string[];
    if (list.includes(medicineId)) {
      next = list.filter((id) => id !== medicineId);
      Alert.alert('내 약 목록에서 제거되었습니다.');
    } else {
      next = [...list, medicineId];
      Alert.alert('내 약 목록에 추가되었습니다.');
    }
    await storage.setMyMedicines(next);
    setInMyList(next.includes(medicineId));
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[typography.h2, { color: colors.text }]}>{medicine.name}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {medicine.genericName} · {medicine.manufacturer}
        </Text>
        <View style={styles.row}>
          <View style={[styles.tag, medicine.isPrescription ? styles.tagPrescription : styles.tagOtc]}>
            <Text style={[styles.tagText, { color: medicine.isPrescription ? colors.emergency : colors.primaryDark }]}>
              {medicine.isPrescription ? '전문의약품' : '일반의약품'}
            </Text>
          </View>
          <View style={[styles.tag, { backgroundColor: colors.border }]}>
            <Text style={[styles.tagText, { color: colors.text }]}>{medicine.category}</Text>
          </View>
        </View>
      </View>

      <Section title="효능/효과">
        <Text style={[typography.body, { color: colors.text }]}>{medicine.effects}</Text>
      </Section>

      <Section title="복용법">
        <Text style={[typography.body, { color: colors.text }]}>{medicine.dosage}</Text>
      </Section>

      <Section title="주의사항">
        {medicine.warnings.map((w, i) => (
          <Text key={i} style={[typography.body, { color: colors.text, marginVertical: 2 }]}>• {w}</Text>
        ))}
      </Section>

      <Section title="성분">
        {medicine.ingredients.map((ing, i) => (
          <Text key={i} style={[typography.body, { color: colors.text }]}>• {ing}</Text>
        ))}
      </Section>

      <Section title="보관">
        <Text style={[typography.body, { color: colors.text }]}>{medicine.storage}</Text>
      </Section>

      <Disclaimer
        text="⚠️ 본 정보는 식약처 공공데이터 기반 참고용이며, 복용 전 반드시 약사/의사와 상담하세요."
      />

      <PrimaryButton
        title={inMyList ? '내 약 목록에서 제거' : '내 약 목록에 추가'}
        variant={inMyList ? 'outline' : 'primary'}
        onPress={toggle}
        style={{ marginTop: spacing.md }}
      />
      <PrimaryButton
        title="상호작용 체크하기"
        variant="secondary"
        onPress={() => navigation.navigate('InteractionCheck')}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.xs }]}>{title}</Text>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  tag: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  tagPrescription: { backgroundColor: '#FFCDD2' },
  tagOtc: { backgroundColor: '#C8E6C9' },
  tagText: { fontSize: 12, fontWeight: '700' },
});
