import React, { useEffect, useState } from 'react';
import { Linking, Share, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { colors as _staticColors, radius, spacing, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { RootStackParamList, SymptomMemo } from '../types';
import { storage } from '../services/storage';
import { AiSummary, summarizeSymptom } from '../services/aiSummary';
import { assessUrgency, careActions } from '../data/careGuide';
import { useLang } from '../i18n/LanguageContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type Props = NativeStackScreenProps<RootStackParamList, 'SymptomSummary'>;

export function SymptomSummaryScreen({ navigation, route }: Props) {
  const colors = useTheme();
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

  const { lang, t } = useLang();
  const urgency = memo ? assessUrgency(memo) : null;
  const actions = memo ? careActions(memo, lang) : [];
  const U = {
    red: { c: colors.emergency, bg: colors.emergencyLight, e: '🔴' },
    yellow: { c: colors.warning, bg: colors.warningLight, e: '🟡' },
    gray: { c: colors.g500, bg: colors.g50, e: '⚪' },
  };
  const u = urgency ? U[urgency] : null;

  const share = () => {
    const text = rows.map(([k, v]) => `• ${k}: ${v}`).join('\n');
    const care = actions.map((a) => `- ${a}`).join('\n');
    const head = urgency ? `[${t(`ef_${urgency}_t`)}] ${t(`ef_${urgency}_m`)}\n\n` : '';
    Share.share({ message: `[라이프라인] 응급 정리\n${head}■ 증상\n${text}\n\n■ 지금 할 수 있는 대처\n${care}\n\n※ 진단이 아닌 정리·안내 자료입니다.` });
  };

  const savePdf = async () => {
    const body = rows.map(([k, v]) => `<p style="margin:6px 0"><b>${k}:</b> ${v}</p>`).join('');
    const aiHtml = ai
      ? `<h3 style="margin-top:18px">요약</h3><p>${ai.summary}</p><h3>병원에서 물어볼 질문</h3>${ai.questions.map((q) => `<p>- ${q}</p>`).join('')}`
      : '';
    const html = `<html><head><meta charset="utf-8"/></head><body style="font-family:-apple-system,sans-serif;padding:28px;color:#191F28">
      <h2 style="color:#3182F6">라이프라인 진료 요약</h2>${body}${aiHtml}
      <p style="color:#888;font-size:12px;margin-top:20px">※ 진단이 아닌 정리 자료입니다. 정확한 진단은 의료기관에서 받으세요.</p></body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: '진료 요약 PDF' });
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title="진료 요약 카드" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>병원에서 이 화면을{'\n'}보여주세요</Text>

        {urgency && u && (
          <View style={[styles.urgent, { borderColor: u.c, backgroundColor: u.bg }]}>
            <Text style={[typography.h3, { color: u.c }]}>{u.e} {t(`ef_${urgency}_t`)}</Text>
            <Text style={[typography.body, { color: colors.text, marginTop: 4 }]}>{t(`ef_${urgency}_m`)}</Text>
            {urgency === 'red' && (
              <View style={[styles.rowBtns, { marginTop: spacing.sm }]}>
                <View style={{ flex: 1 }}><PrimaryButton title={t('ef_call119')} icon="📞" variant="emergency" onPress={() => Linking.openURL('tel:119')} /></View>
                <View style={{ width: spacing.sm }} />
                <View style={{ flex: 1 }}><PrimaryButton title={t('ef_find_er')} icon="🏥" variant="primary" onPress={() => navigation.navigate('HospitalFinder', { kind: 'er' })} /></View>
              </View>
            )}
          </View>
        )}

        {actions.length > 0 && (
          <View style={[styles.careCard, shadow.card, { backgroundColor: colors.card }]}>
            <Text style={[typography.h3, { color: colors.text }]}>🤖 AI 의견 · 지금 할 수 있는 대처</Text>
            <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>AI 의견은 참고사항입니다. 정확한 판단은 의료진에게 받으세요.</Text>
            {actions.map((a, i) => (
              <View key={i} style={styles.careRow}>
                <Text style={[styles.careDot, { color: colors.work }]}>•</Text>
                <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{a}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.card, shadow.card, { backgroundColor: colors.card }]}>
          {rows.map(([k, v]) => (
            <View key={k} style={[styles.row, { borderBottomColor: colors.divider }]}>
              <Text style={[typography.caption, { color: colors.textMuted, width: 92 }]}>{k}</Text>
              <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{v}</Text>
            </View>
          ))}
        </View>

        {ai && (
          <View style={[styles.aiCard, shadow.card, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
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

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <View style={styles.rowBtns}>
          <View style={{ flex: 1 }}><PrimaryButton title="병원 찾기" icon="🏥" variant="primary" onPress={() => navigation.navigate('HospitalFinder')} /></View>
          <View style={{ width: spacing.sm }} />
          <View style={{ flex: 1 }}><PrimaryButton title="공유" icon="👥" variant="outline" onPress={share} /></View>
        </View>
        <PrimaryButton title="PDF로 저장·전송" icon="📄" variant="ghost" onPress={savePdf} style={{ marginTop: spacing.sm }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 색은 렌더 시 useTheme()로 덮음 — 여기 값은 정적 기본(라이트)일 뿐
  wrap: { flex: 1, backgroundColor: _staticColors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: { backgroundColor: _staticColors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: _staticColors.divider },
  aiCard: { backgroundColor: _staticColors.primaryLight, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: _staticColors.border },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: _staticColors.divider },
  rowBtns: { flexDirection: 'row' },
  urgent: { borderWidth: 1.5, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md },
  careCard: { backgroundColor: _staticColors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md },
  careRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  careDot: { color: _staticColors.work, fontSize: 16, fontWeight: '900', marginRight: 8, lineHeight: 22 },
});
