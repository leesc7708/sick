import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList, Medicine } from '../types';
import { storage } from '../services/storage';
import { findMedicine } from '../data/mockMedicines';

type Props = NativeStackScreenProps<RootStackParamList, 'MyMedicines'>;

export function MyMedicinesScreen({ navigation }: Props) {
  const [items, setItems] = useState<Medicine[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const ids = await storage.getMyMedicines();
        setItems(ids.map((id) => findMedicine(id)).filter(Boolean) as Medicine[]);
      })();
    }, []),
  );

  async function remove(id: string) {
    const next = items.filter((m) => m.id !== id).map((m) => m.id);
    await storage.setMyMedicines(next);
    setItems(items.filter((m) => m.id !== id));
  }

  return (
    <Screen>
      <Text style={[typography.h2, styles.title]}>내 약 목록</Text>
      <Text style={[typography.caption, styles.subtitle]}>
        등록한 약은 상호작용 체크와 AI 증상 분석에 활용됩니다.
      </Text>

      {items.length === 0 ? (
        <Card>
          <Text style={[typography.body, styles.empty]}>등록된 약이 없습니다.</Text>
          <PrimaryButton
            title="약 검색하기"
            onPress={() => navigation.navigate('MedicineSearch')}
            style={{ marginTop: spacing.md }}
          />
        </Card>
      ) : (
        <>
          {items.map((m) => (
            <Card key={m.id} onPress={() => navigation.navigate('MedicineDetail', { medicineId: m.id })}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{m.name}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {m.genericName} · {m.category}
                  </Text>
                </View>
                <PrimaryButton title="제거" variant="outline" onPress={() => remove(m.id)} />
              </View>
            </Card>
          ))}

          <PrimaryButton
            title="상호작용 체크"
            variant="secondary"
            onPress={() => navigation.navigate('InteractionCheck')}
            style={{ marginTop: spacing.md }}
          />
          <PrimaryButton
            title="더 추가하기"
            variant="outline"
            onPress={() => navigation.navigate('MedicineSearch')}
            style={{ marginTop: spacing.sm }}
          />
        </>
      )}

      <Disclaimer compact />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  empty: { color: colors.textSecondary, textAlign: 'center' },
});
