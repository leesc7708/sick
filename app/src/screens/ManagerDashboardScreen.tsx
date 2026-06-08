import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Tag } from '../components/Tag';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { HealthCheckRecord, IncidentReport, RootStackParamList, WorkHealthCheck } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'ManagerDashboard'>;

const TOTAL_WORKERS = 12; // 데모: 현장 배정 인원

export function ManagerDashboardScreen({ navigation }: Props) {
  const [checks, setChecks] = useState<WorkHealthCheck[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [records, setRecords] = useState<HealthCheckRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setChecks(await storage.getWorkChecks());
        setIncidents(await storage.getIncidents());
        setRecords(await storage.getHealthRecords());
      })();
    }, []),
  );

  const expiringSoon = records.filter((r) => {
    if (!r.expireDate) return false;
    const left = (new Date(r.expireDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return left <= 30;
  }).length;
  const valid = records.length - expiringSoon;

  return (
    <View style={styles.wrap}>
      <AppBar title="관리자 대시보드" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>온산 현장 · 오늘</Text>

        <View style={styles.statsRow}>
          <View style={[styles.stat, shadow.card]}>
            <Text style={styles.statNum}>{TOTAL_WORKERS}</Text>
            <Text style={styles.statLabel}>작업 인원</Text>
          </View>
          <View style={{ width: spacing.sm }} />
          <View style={[styles.stat, shadow.card]}>
            <Text style={[styles.statNum, { color: colors.success }]}>{checks.length}</Text>
            <Text style={styles.statLabel}>작업 전 체크 완료</Text>
          </View>
        </View>

        {incidents.length > 0 ? (
          <View style={[styles.incident, shadow.card]}>
            <Text style={[typography.bodyBold, { color: colors.emergency }]}>🚨 실시간 사고 보고 {incidents.length}건</Text>
            <Text style={[typography.caption, { color: colors.text, marginTop: 4 }]}>
              최근: {incidents[0].type} · {incidents[0].reportedAt} · {incidents[0].locationText ?? '위치 첨부'}
            </Text>
          </View>
        ) : (
          <View style={[styles.card, shadow.card]}>
            <Text style={[typography.bodyBold, { color: colors.success }]}>🟢 보고된 사고 없음</Text>
          </View>
        )}

        <View style={[styles.card, shadow.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[typography.bodyBold, { color: colors.text }]}>검진 유효성</Text>
            <View style={{ marginLeft: 8 }}><Tag label="v1.5" tone="new" /></View>
          </View>
          <Text style={[typography.body, { color: colors.success, marginTop: 6 }]}>🟢 유효 {valid < 0 ? 0 : valid}명</Text>
          {expiringSoon > 0 && <Text style={[typography.body, { color: colors.warning, marginTop: 2 }]}>⚠️ 만료 임박 {expiringSoon}건</Text>}
          {records.length === 0 && <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>등록된 검진기록이 없습니다.</Text>}
        </View>

        <View style={[styles.card, shadow.card]}>
          <Text style={[typography.bodyBold, { color: colors.text }]}>사전 등록</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>산재지정병원 · 권역응급의료센터 · 중독관리센터 목록(데모)</Text>
        </View>

        <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.md }]}>
          ※ 데모 화면입니다. 실제 서비스에서는 웹 관리자 콘솔로 제공되며 인원·동의 기반으로 집계됩니다.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', marginTop: spacing.md },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center' },
  statNum: { fontSize: 30, fontWeight: '800', color: colors.text },
  statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  incident: { backgroundColor: '#FFF5F5', borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.sm, borderWidth: 1.5, borderColor: '#FFD9D6' },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.sm },
});
