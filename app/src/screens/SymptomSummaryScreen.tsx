import React, { useEffect, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList, SymptomMemo } from '../types';
import { storage } from '../services/storage';
import { AiSummary, summarizeSymptom } from '../services/aiSummary';

type Props = NativeStackScreenProps<RootStackParamList, 'SymptomSummary'>;

export function SymptomSummaryScreen({ navigation, route }: Props) {
  const memoId = route.params?.memoId;
  const [memo, setMemo] = useState<SymptomMemo | null>(null);
  const [ai, setAi] = useState<AiSummary | null>(null);

  useEffect(() => {
    (async () => {
      if (!memoId) return;
      const m = await storage.getSymptomMemo(memoId);
      setMemo(m);
      if (m) setAi(await summarizeSymptom(m));
    })();
  }, [memoId]);

  const rows: [string, string][] = memo
    ? [
        ['시작 시점', memo.startedAt || '미입력'],
        ['부위', memo.bodyParts.join(', ') || '미입력'],
        ['강도', typeof memo.severity === 'number' ? `${memo.severity}/10` : '미입력'],
        ['동반 증상', memo.accompanying.join(', ') || '없음'],
        ['작업 중 발생', memo.atWork ? `예${memo.workType ? ` (${memo.workType})` : ''}` : '아니오'],
        ['걱정되는 점', memo.concern || '없음'],
      ]
    : [];

  const share = () => {
    const text = rows.map(([k, v]) => `• ${k}: ${v}`).join('\n');
    Share.share({ message: `[세이프콜] 진료 요약\n${text}\n\n※ 진단이 아닌 정리 자료입니다.` });
  };

  return (
    <View style={styles.wrap}>
      <AppBar title="진료 요약 카드" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>병원에서 이 화면을{'\n'}보여주세요</Text>

        <View style={[styles.card, shadow.card]}>
          {rows.map(([k, v]) => (
            <View key={k} style={styles.row}>
              <Text style={[typography.caption, { color: colors.textMuted, width: 92 }]}>{k}</Text>
              <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{v}</Text>
            </View>
          ))}
        </View>

        {ai && (
          <View style={[styles.aiCard, shadow.card]}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>📝 요약</Text>
            <Text style={[typography.body, { color: colors.text, marginTop: 4 }]}>{ai.summary}</Text>
            <Text style={[typography.captionBold, { color: colors.primary, marginTop: spacing.md }]}>💡 병원에서 물어볼 질문</Text>
            {ai.questions.map((q, i) => (
              <Text key={i} style={[typography.body, { color: colors.text, marginTop: 4 }]}>- {q}</Text>
            ))}
          </View>
        )}

        <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.sm }]}>
          ※ AI는 입력 내용을 정리만 합니다. 병명·확률을 추정하지 않습니다.
        </Text>
        <Disclaimer compact />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.rowBtns}>
          <View style={{ flex: 1 }}><PrimaryButton title="병원 찾기" icon="🏥" variant="primary" onPress={() => navigation.navigate('HospitalFinder')} /></View>
          <View style={{ width: spacing.sm }} />
          <View style={{ flex: 1 }}><PrimaryButton title="공유" icon="👥" variant="outline" onPress={share} /></View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  aiCard: { backgroundColor: '#F4F9FF', borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: '#D8E9FF' },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
  rowBtns: { flexDirection: 'row' },
});
