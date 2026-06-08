import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Disclaimer } from '../components/Disclaimer';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types';
import { searchMedicines } from '../data/mockMedicines';

type Props = NativeStackScreenProps<RootStackParamList, 'MedicineSearch'>;

export function MedicineSearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const results = searchMedicines(query);

  return (
    <Screen>
      <Text style={[typography.h2, styles.title]}>약 검색</Text>
      <TextInput
        style={styles.search}
        placeholder="약 이름, 성분, 효능으로 검색"
        value={query}
        onChangeText={setQuery}
        placeholderTextColor={colors.textMuted}
      />
      <Disclaimer
        text="⚠️ 약품 정보는 식약처 공공데이터 기반 참고용입니다. 복용 전 반드시 약사와 상담하세요."
        compact
      />

      {results.length === 0 ? (
        <Card>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            검색 결과가 없습니다.
          </Text>
        </Card>
      ) : (
        results.map((m) => (
          <Card key={m.id} onPress={() => navigation.navigate('MedicineDetail', { medicineId: m.id })}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text }]}>{m.name}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {m.genericName} · {m.manufacturer}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                  {m.category}
                </Text>
              </View>
              {m.isPrescription ? (
                <View style={[styles.badge, { backgroundColor: '#FFCDD2' }]}>
                  <Text style={[styles.badgeText, { color: colors.emergency }]}>전문</Text>
                </View>
              ) : (
                <View style={[styles.badge, { backgroundColor: '#C8E6C9' }]}>
                  <Text style={[styles.badgeText, { color: colors.primaryDark }]}>일반</Text>
                </View>
              )}
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, marginBottom: spacing.md },
  search: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
