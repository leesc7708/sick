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
import { translations } from '../i18n/translations';
import { AC_KEY, BP_KEY, WT_KEY, label, labelList } from '../i18n/optionKeys';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type Props = NativeStackScreenProps<RootStackParamList, 'SymptomSummary'>;

// 한국어 원문 — 의료진이 읽어야 하는 쪽. 사용자 언어가 무엇이든 항상 한국어로 뽑는다.
const ko = (key: string) => translations.ko[key] ?? key;

// 병기 표기: 사용자 언어와 한국어가 같으면(=한국어 사용자) 한 번만
function pair(mine: string, korean: string): string {
  return mine === korean ? mine : `${mine} / ${korean}`;
}

type Row = { label: string; koLabel: string; value: string; koValue: string };

export function SymptomSummaryScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const memoId = route.params?.memoId;
  const [memo, setMemo] = useState<SymptomMemo | null>(null);
  const [ai, setAi] = useState<AiSummary | null>(null);
  const { lang, t } = useLang();
  const bilingual = lang !== 'ko';

  useEffect(() => {
    (async () => {
      if (!memoId) return;
      const m = await storage.getSymptomMemo(memoId);
      setMemo(m);
      if (m) setAi(await summarizeSymptom(m));
    })();
  }, [memoId]);

  // 저장값은 한국어 원본 — 사용자 언어 라벨과 한국어 원문을 함께 만들어 의료진이 그대로 읽게 한다
  const rows: Row[] = memo
    ? [
        {
          label: t('ss_started'), koLabel: ko('ss_started'),
          value: memo.startedAt || t('ss_empty'), koValue: memo.startedAt || ko('ss_empty'),
        },
        {
          label: t('ss_part'), koLabel: ko('ss_part'),
          value: labelList(BP_KEY, memo.bodyParts, t) || t('ss_empty'),
          koValue: memo.bodyParts.join(', ') || ko('ss_empty'),
        },
        {
          label: t('ss_severity'), koLabel: ko('ss_severity'),
          value: typeof memo.severity === 'number' ? `${memo.severity}/10` : t('ss_empty'),
          koValue: typeof memo.severity === 'number' ? `${memo.severity}/10` : ko('ss_empty'),
        },
        {
          label: t('ss_accom'), koLabel: ko('ss_accom'),
          value: labelList(AC_KEY, memo.accompanying, t) || t('ss_none'),
          koValue: memo.accompanying.join(', ') || ko('ss_none'),
        },
        {
          label: t('ss_atwork'), koLabel: ko('ss_atwork'),
          value: memo.atWork ? `${t('si_yes')}${memo.workType ? ` (${label(WT_KEY, memo.workType, t)})` : ''}` : t('si_no'),
          koValue: memo.atWork ? `${ko('si_yes')}${memo.workType ? ` (${memo.workType})` : ''}` : ko('si_no'),
        },
        {
          label: t('ss_concern'), koLabel: ko('ss_concern'),
          value: memo.concern || t('ss_none'), koValue: memo.concern || ko('ss_none'),
        },
      ]
    : [];

  const urgency = memo ? assessUrgency(memo) : null;
  const actions = memo ? careActions(memo, lang) : [];
  const U = {
    red: { c: colors.emergency, bg: colors.emergencyLight, e: '🔴' },
    yellow: { c: colors.warning, bg: colors.warningLight, e: '🟡' },
    gray: { c: colors.g500, bg: colors.g50, e: '⚪' },
  };
  const u = urgency ? U[urgency] : null;

  const share = () => {
    const text = rows.map((r) => `• ${pair(r.label, r.koLabel)}: ${pair(r.value, r.koValue)}`).join('\n');
    const care = actions.map((a) => `- ${a}`).join('\n');
    const head = urgency ? `[${pair(t(`ef_${urgency}_t`), ko(`ef_${urgency}_t`))}] ${t(`ef_${urgency}_m`)}\n\n` : '';
    const title = pair(t('ss_share_t'), ko('ss_share_t'));
    Share.share({
      message: `[라이프라인] ${title}\n${head}■ ${pair(t('ss_share_sym'), ko('ss_share_sym'))}\n${text}\n\n■ ${t('ss_share_care')}\n${care}\n\n※ ${t('ss_share_note')}`,
    });
  };

  const savePdf = async () => {
    const body = rows
      .map((r) => `<p style="margin:6px 0"><b>${pair(r.label, r.koLabel)}:</b> ${pair(r.value, r.koValue)}</p>`)
      .join('');
    const aiHtml = ai
      ? `<h3 style="margin-top:18px">${pair(t('ss_sum'), ko('ss_sum'))}</h3><p>${ai.summary}</p>` +
        `<h3>${t('ss_q')}</h3>${ai.questions.map((q) => `<p>- ${q}</p>`).join('')}`
      : '';
    const html = `<html><head><meta charset="utf-8"/></head><body style="font-family:-apple-system,sans-serif;padding:28px;color:#191F28">
      <h2 style="color:#1B64DA">${pair(t('ss_pdf_title'), ko('ss_pdf_title'))}</h2>${body}${aiHtml}
      <p style="color:#888;font-size:12px;margin-top:20px">※ ${pair(t('ss_share_note'), ko('ss_share_note'))}</p></body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: t('ss_pdf_title') });
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title={t('ss_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>{t('ss_head')}</Text>
        {bilingual && (
          <Text style={[typography.small, { color: colors.textMuted, marginTop: 6 }]}>{t('ss_ko_note')}</Text>
        )}

        {urgency && u && (
          <View style={[styles.urgent, { borderColor: u.c, backgroundColor: u.bg }]}>
            <Text style={[typography.h3, { color: u.c }]}>{u.e} {t(`ef_${urgency}_t`)}</Text>
            {bilingual && <Text style={[typography.captionBold, { color: u.c, marginTop: 2 }]}>{ko(`ef_${urgency}_t`)}</Text>}
            <Text style={[typography.body, { color: colors.text, marginTop: 4 }]}>{t(`ef_${urgency}_m`)}</Text>
            {bilingual && <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}>{ko(`ef_${urgency}_m`)}</Text>}
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
            <Text style={[typography.h3, { color: colors.text }]}>{t('ss_care_t')}</Text>
            <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>{t('ss_care_note')}</Text>
            {actions.map((a, i) => (
              <View key={i} style={styles.careRow}>
                <Text style={[styles.careDot, { color: colors.work }]}>•</Text>
                <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{a}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.card, shadow.card, { backgroundColor: colors.card }]}>
          {rows.map((r) => (
            <View key={r.koLabel} style={[styles.row, { borderBottomColor: colors.divider }]}>
              <View style={{ width: 96 }}>
                <Text style={[typography.caption, { color: colors.textMuted }]}>{r.label}</Text>
                {bilingual && <Text style={[typography.small, { color: colors.textMuted, opacity: 0.75 }]}>{r.koLabel}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text }]}>{r.value}</Text>
                {bilingual && r.value !== r.koValue && (
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{r.koValue}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {ai && (
          <View style={[styles.aiCard, shadow.card, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>{t('ss_sum')}</Text>
            <Text style={[typography.body, { color: colors.text, marginTop: 4 }]}>{ai.summary}</Text>
            <Text style={[typography.captionBold, { color: colors.primary, marginTop: spacing.md }]}>{t('ss_q')}</Text>
            {ai.questions.map((q, i) => (
              <Text key={i} style={[typography.body, { color: colors.text, marginTop: 4 }]}>- {q}</Text>
            ))}
          </View>
        )}

        <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.sm }]}>{t('ss_foot')}</Text>
        <Disclaimer compact />
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <View style={styles.rowBtns}>
          <View style={{ flex: 1 }}><PrimaryButton title={t('ss_hospital')} icon="🏥" variant="primary" onPress={() => navigation.navigate('HospitalFinder')} /></View>
          <View style={{ width: spacing.sm }} />
          <View style={{ flex: 1 }}><PrimaryButton title={t('ss_share')} icon="👥" variant="outline" onPress={share} /></View>
        </View>
        <PrimaryButton title={t('ss_pdf')} icon="📄" variant="ghost" onPress={savePdf} style={{ marginTop: spacing.sm }} />
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
