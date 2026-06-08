import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { HistoryItem, RootStackParamList } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

const ICON: Record<string, string> = { symptom: '📝', incident: '⚠️', workcheck: '✅' };

export function HistoryScreen({ navigation }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const memos = await storage.getSymptomMemos();
        const incidents = await storage.getIncidents();
        const checks = await storage.getWorkChecks();
        const merged: HistoryItem[] = [
          ...memos.map((m) => ({ id: m.id, kind: 'symptom' as const, title: `증상 메모${m.atWork ? ' (작업 중)' : ''}`, subtitle: m.bodyParts.join(', ') || undefined, date: m.createdAt })),
          ...incidents.map((i) => ({ id: i.id, kind: 'incident' as const, title: `사고 보고 · ${i.type}`, subtitle: i.locationText, date: i.reportedAt })),
          ...checks.map((c) => ({ id: c.id, kind: 'workcheck' as const, title: '작업 전 체크', subtitle: c.workType, date: c.completedAt })),
        ].sort((a, b) => (a.date < b.date ? 1 : -1));
        setItems(merged);
      })();
    }, []),
  );

  return (
    <View style={styles.wrap}>
      <AppBar title="지난 기록" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 && (
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>아직 기록이 없어요.</Text>
        )}
        {items.map((it) => (
          <View key={it.id} style={[styles.card, shadow.card]}>
            <Text style={{ fontSize: 20, marginRight: 12 }}>{ICON[it.kind]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyBold, { color: colors.text }]}>{it.title}</Text>
              {it.subtitle ? <Text style={[typography.caption, { color: colors.textMuted }]}>{it.subtitle}</Text> : null}
            </View>
            <Text style={[typography.small, { color: colors.g400 }]}>{it.date}</Text>
          </View>
        ))}
        {items.length > 0 && (
          <Text style={[typography.small, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md }]}>로컬에 저장됩니다 · 계정 동기화는 v1.5</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' },
});
