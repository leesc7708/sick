import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { InteractionResult, Medicine, RiskLevel, RootStackParamList } from '../types';
import { storage } from '../services/storage';
import { checkInteractions, findMedicine } from '../data/mockMedicines';

type Props = NativeStackScreenProps<RootStackParamList, 'InteractionCheck'>;

const RISK_INFO: Record<RiskLevel, { label: string; emoji: string; color: string; bg: string }> = {
  critical: { label: '매우 위험', emoji: '🔴', color: '#fff', bg: colors.emergency },
  high: { label: '위험', emoji: '🟠', color: '#fff', bg: colors.riskHigh },
  medium: { label: '주의', emoji: '🟡', color: colors.text, bg: '#FFE082' },
  low: { label: '낮은 위험', emoji: '🟢', color: '#fff', bg: colors.primary },
  unknown: { label: '정보 없음', emoji: '⚪', color: colors.text, bg: colors.border },
};

export function InteractionCheckScreen({ navigation }: Props) {
  const [items, setItems] = useState<Medicine[]>([]);
  const [results, setResults] = useState<InteractionResult[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const ids = await storage.getMyMedicines();
        const meds = ids.map((id) => findMedicine(id)).filter(Boolean) as Medicine[];
        setItems(meds);
        setResults(checkInteractions(ids));
      })();
    }, []),
  );

  return (
    <Screen>
      <Text style={[typography.h2, styles.title]}>약 상호작용 체크</Text>
      <Text style={[typography.caption, styles.subtitle]}>
        내 약 목록에 등록된 약들의 상호작용을 분석합니다.
      </Text>

      <Card>
        <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.sm }]}>
          체크 대상 약 ({items.length}개)
        </Text>
        {items.length === 0 ? (
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            등록된 약이 없습니다.
          </Text>
        ) : (
          items.map((m) => (
            <Text key={m.id} style={[typography.body, { color: colors.text, marginVertical: 2 }]}>
              • {m.name}
            </Text>
          ))
        )}
        <PrimaryButton
          title={items.length === 0 ? '약 추가하기' : '약 추가/관리'}
          variant="outline"
          onPress={() => navigation.navigate('MyMedicines')}
          style={{ marginTop: spacing.md }}
        />
      </Card>

      {items.length >= 1 && (
        <>
          <Text style={[typography.h3, styles.sectionTitle]}>분석 결과</Text>
          {results.length === 0 ? (
            <Card>
              <Text style={[typography.body, { color: colors.text }]}>
                {items.length === 1
                  ? '단일 약품 정보입니다. 다른 약을 추가하면 상호작용을 체크합니다.'
                  : '알려진 위험한 상호작용은 발견되지 않았습니다.'}
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                ※ 모든 상호작용을 포함하지 않을 수 있습니다. 복용 전 약사 상담을 권장합니다.
              </Text>
            </Card>
          ) : (
            results.map((r, i) => {
              const info = RISK_INFO[r.level];
              return (
                <Card key={i} style={{ borderColor: info.bg, borderWidth: 2 }}>
                  <View style={[styles.riskBadge, { backgroundColor: info.bg }]}>
                    <Text style={[styles.riskBadgeText, { color: info.color }]}>
                      {info.emoji} {info.label}
                    </Text>
                  </View>
                  <Text style={[typography.bodyBold, { color: colors.text, marginTop: spacing.sm }]}>
                    {r.medicineA === r.medicineB ? r.medicineA : `${r.medicineA} × ${r.medicineB}`}
                  </Text>
                  <Text style={[typography.body, { color: colors.text, marginTop: spacing.xs }]}>
                    {r.description}
                  </Text>
                  <Text style={[typography.caption, { color: colors.primary, marginTop: spacing.sm, fontWeight: '600' }]}>
                    💡 {r.recommendation}
                  </Text>
                </Card>
              );
            })
          )}
        </>
      )}

      <Disclaimer
        text="⚠️ 본 정보는 식약처 공공데이터 기반이며, 모든 상호작용을 포함하지 않을 수 있습니다. 복용 전 반드시 약사와 상담하세요."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.md },
  sectionTitle: { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  riskBadgeText: { fontSize: 13, fontWeight: '700' },
});
