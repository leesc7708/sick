import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SymptomResult'>;

const URGENCY_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  emergency: { label: '응급 - 즉시 119/응급실', color: '#fff', bg: colors.emergency },
  urgent: { label: '긴급 - 24시간 내 진료 권장', color: '#fff', bg: colors.danger },
  soon: { label: '권장 - 1-3일 내 진료', color: '#fff', bg: colors.warning },
  routine: { label: '일반 - 지속되면 진료', color: '#fff', bg: colors.primary },
};

const PROB_LABEL: Record<string, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

export function SymptomResultScreen({ navigation, route }: Props) {
  const { analysis, query } = route.params;
  const urgency = URGENCY_LABEL[analysis.urgency] ?? URGENCY_LABEL.routine;

  return (
    <Screen>
      <Text style={[typography.h2, styles.title]}>증상 정보 분석 결과</Text>
      <Text style={[typography.caption, styles.queryPreview]}>
        입력: "{query.text.length > 60 ? query.text.slice(0, 60) + '...' : query.text}"
      </Text>

      <View style={[styles.urgencyBadge, { backgroundColor: urgency.bg }]}>
        <Text style={[typography.bodyBold, { color: urgency.color }]}>{urgency.label}</Text>
      </View>

      <Text style={[typography.h3, styles.sectionTitle]}>관련 가능 상태 (참고용)</Text>
      {analysis.possibleConditions.length === 0 ? (
        <Card>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            구체적인 가능 상태를 추론하기 어렵습니다. 의료기관 방문을 권장합니다.
          </Text>
        </Card>
      ) : (
        analysis.possibleConditions.map((c, idx) => (
          <Card key={idx}>
            <View style={styles.condHeader}>
              <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{c.name}</Text>
              <View style={[styles.probBadge, probColor(c.probability)]}>
                <Text style={styles.probText}>가능성 {PROB_LABEL[c.probability]}</Text>
              </View>
            </View>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              {c.description}
            </Text>
          </Card>
        ))
      )}

      <Text style={[typography.h3, styles.sectionTitle]}>관련 진료과 안내</Text>
      <View style={styles.deptRow}>
        {analysis.recommendedDepartments.map((d) => (
          <View key={d} style={styles.deptChip}>
            <Text style={styles.deptText}>{d}</Text>
          </View>
        ))}
      </View>

      {analysis.selfCare.length > 0 && (
        <>
          <Text style={[typography.h3, styles.sectionTitle]}>자가 관리 정보</Text>
          <Card>
            {analysis.selfCare.map((s, i) => (
              <Text key={i} style={[typography.body, styles.selfCareItem]}>
                • {s}
              </Text>
            ))}
          </Card>
        </>
      )}

      <Disclaimer />

      <PrimaryButton
        title="근처 병원 찾기"
        onPress={() =>
          navigation.navigate('HospitalFinder', { departments: analysis.recommendedDepartments })
        }
        style={{ marginTop: spacing.md }}
      />
      <PrimaryButton
        title="홈으로"
        variant="outline"
        onPress={() => navigation.popToTop()}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}

function probColor(p: string) {
  if (p === 'high') return { backgroundColor: '#FFCDD2' };
  if (p === 'medium') return { backgroundColor: '#FFE0B2' };
  return { backgroundColor: '#E1F5FE' };
}

const styles = StyleSheet.create({
  title: { color: colors.text, marginBottom: spacing.xs },
  queryPreview: { color: colors.textMuted, marginBottom: spacing.md },
  urgencyBadge: {
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  condHeader: { flexDirection: 'row', alignItems: 'center' },
  probBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  probText: { fontSize: 11, fontWeight: '600', color: colors.text },
  deptRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  deptChip: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  deptText: { color: colors.textInverse, fontWeight: '600' },
  selfCareItem: { color: colors.text, marginVertical: 2 },
});
