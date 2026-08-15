import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { colors as _staticColors, radius, spacing, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { HistoryItem, IncidentReport, RootStackParamList, SymptomMemo, WorkHealthCheck } from '../types';
import { storage } from '../services/storage';
import { useLang } from '../i18n/LanguageContext';
import { BP_KEY, IT_KEY, WT_KEY, label, labelList } from '../i18n/optionKeys';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

const ICON: Record<string, string> = { symptom: '📝', incident: '⚠️', workcheck: '✅' };

export function HistoryScreen({ navigation }: Props) {
  const colors = useTheme();
  const { t } = useLang();
  // 원본을 그대로 담아 두고 라벨은 렌더 시 번역 — 언어를 바꾸면 목록도 즉시 따라간다
  const [raw, setRaw] = useState<{ memos: SymptomMemo[]; incidents: IncidentReport[]; checks: WorkHealthCheck[] }>({ memos: [], incidents: [], checks: [] });

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setRaw({
          memos: await storage.getSymptomMemos(),
          incidents: await storage.getIncidents(),
          checks: await storage.getWorkChecks(),
        });
      })();
    }, []),
  );

  const items: HistoryItem[] = useMemo(
    () =>
      [
        ...raw.memos.map((m) => ({
          id: m.id,
          kind: 'symptom' as const,
          title: `${t('hist_symptom')}${m.atWork ? ` (${t('hist_atwork')})` : ''}`,
          subtitle: labelList(BP_KEY, m.bodyParts, t) || undefined,
          date: m.createdAt,
        })),
        ...raw.incidents.map((i) => ({
          id: i.id,
          kind: 'incident' as const,
          title: `${t('hist_incident')} · ${label(IT_KEY, i.type, t)}`,
          subtitle: i.locationText,
          date: i.reportedAt,
        })),
        ...raw.checks.map((c) => ({
          id: c.id,
          kind: 'workcheck' as const,
          title: t('hist_workcheck'),
          subtitle: label(WT_KEY, c.workType, t),
          date: c.completedAt,
        })),
      ].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [raw, t],
  );

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title={t('hist_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 && (
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>{t('hist_empty')}</Text>
        )}
        {items.map((it) => (
          <View key={it.id} style={[styles.card, shadow.card, { backgroundColor: colors.card }]}>
            <Text style={{ fontSize: 20, marginRight: 12 }}>{ICON[it.kind]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyBold, { color: colors.text }]}>{it.title}</Text>
              {it.subtitle ? <Text style={[typography.caption, { color: colors.textMuted }]}>{it.subtitle}</Text> : null}
            </View>
            <Text style={[typography.small, { color: colors.textMuted }]}>{it.date}</Text>
          </View>
        ))}
        {items.length > 0 && (
          <Text style={[typography.small, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md }]}>{t('hist_local')}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // 색은 렌더 시 useTheme()로 덮음 — 여기 값은 정적 기본(라이트)일 뿐
  wrap: { flex: 1, backgroundColor: _staticColors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: { backgroundColor: _staticColors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' },
});
