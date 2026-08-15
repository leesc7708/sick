import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Tag } from '../components/Tag';
import { colors as _staticColors, radius, spacing, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { HealthCheckRecord, IncidentReport, RootStackParamList, WorkHealthCheck } from '../types';
import { storage } from '../services/storage';
import { useLang } from '../i18n/LanguageContext';
import { IT_KEY, label } from '../i18n/optionKeys';

type Props = NativeStackScreenProps<RootStackParamList, 'ManagerDashboard'>;

// ⚠️ 데모 표본값 — 실서비스에서는 크루(멤버십) 소속 인원으로 자동 집계.
// 지금은 로컬 데모라 실인원 소스가 없어 예시 숫자를 쓰며, 화면에 "예시"로 명시함(오인 방지).
const TOTAL_WORKERS = 12; // 데모 표본: 현장 배정 인원(예시)

export function ManagerDashboardScreen({ navigation }: Props) {
  const colors = useTheme();
  const { t } = useLang();
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
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title={t('md_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>{t('md_head')}</Text>

        <View style={styles.statsRow}>
          <View style={[styles.stat, shadow.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNum, { color: colors.textMuted }]}>{TOTAL_WORKERS}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('md_workers')}</Text>
            {/* 정직화: 하드코딩 표본값임을 숫자 옆에 명시 → 실데이터 오인 방지(심사 지적) */}
            <Tag label={t('md_sample')} tone="new" />
          </View>
          <View style={{ width: spacing.sm }} />
          <View style={[styles.stat, shadow.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNum, { color: colors.success }]}>{checks.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('md_checks')}</Text>
            <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>{t('md_real')}</Text>
          </View>
        </View>

        {incidents.length > 0 ? (
          <View style={[styles.incident, shadow.card, { backgroundColor: colors.emergencyLight, borderColor: colors.emergency }]}>
            {/* 개수는 괄호로 뒤에 붙인다 — "N건"처럼 조사·어순이 언어마다 달라지는 형태를 피하려고 */}
            <Text style={[typography.bodyBold, { color: colors.emergency }]}>{t('md_inc_t')} ({incidents.length})</Text>
            <Text style={[typography.caption, { color: colors.text, marginTop: 4 }]}>
              {t('md_inc_recent')}: {label(IT_KEY, incidents[0].type, t)} · {incidents[0].reportedAt} · {incidents[0].locationText ?? t('md_loc_attached')}
            </Text>
          </View>
        ) : (
          <View style={[styles.card, shadow.card, { backgroundColor: colors.card }]}>
            <Text style={[typography.bodyBold, { color: colors.success }]}>{t('md_no_inc')}</Text>
          </View>
        )}

        <View style={[styles.card, shadow.card, { backgroundColor: colors.card }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[typography.bodyBold, { color: colors.text }]}>{t('md_exam_t')}</Text>
            <View style={{ marginLeft: 8 }}><Tag label="v1.5" tone="new" /></View>
          </View>
          <Text style={[typography.body, { color: colors.success, marginTop: 6 }]}>{t('md_valid')} ({valid < 0 ? 0 : valid})</Text>
          {expiringSoon > 0 && <Text style={[typography.body, { color: colors.warning, marginTop: 2 }]}>{t('md_expiring')} ({expiringSoon})</Text>}
          {records.length === 0 && <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>{t('md_no_rec')}</Text>}
        </View>

        <View style={[styles.card, shadow.card, { backgroundColor: colors.card }]}>
          <Text style={[typography.bodyBold, { color: colors.text }]}>{t('md_pre_t')}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>{t('md_pre_m')}</Text>
        </View>

        <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.md }]}>{t('md_foot')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // 색은 렌더 시 useTheme()로 덮음 — 여기 값은 정적 기본(라이트)일 뿐
  wrap: { flex: 1, backgroundColor: _staticColors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', marginTop: spacing.md },
  stat: { flex: 1, backgroundColor: _staticColors.card, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center' },
  statNum: { fontSize: 30, fontWeight: '800', color: _staticColors.text },
  statLabel: { ...typography.caption, color: _staticColors.textMuted, marginTop: 2 },
  incident: { backgroundColor: _staticColors.emergencyLight, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.sm, borderWidth: 1.5, borderColor: _staticColors.emergency },
  card: { backgroundColor: _staticColors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.sm },
});
