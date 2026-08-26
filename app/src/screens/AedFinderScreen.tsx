import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors as _staticColors, radius, spacing, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types';
import { useLang } from '../i18n/LanguageContext';
import { LoadError } from '../components/LoadError';
import { SIDO_LIST, fetchAed, detectSido, AedItem } from '../data/egen';

type Props = NativeStackScreenProps<RootStackParamList, 'AedFinder'>;

export function AedFinderScreen({ navigation }: Props) {
  const { t } = useLang();
  const colors = useTheme();
  const [sido, setSido] = useState<string>('서울특별시');
  const [list, setList] = useState<AedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // 조회 실패를 "이 지역 AED 없음"으로 위장하지 않는다 (2026-08-26 프록시 503 장애 교훈)
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const retry = () => setReload((n) => n + 1);

  // 진입 시 GPS로 내 지역 자동선택 (실패/거부 시 기본값 유지)
  useEffect(() => {
    let alive = true;
    detectSido().then((s) => { if (alive && s) setSido(s); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchAed(sido)
      .then((r) => {
        if (!alive) return;
        setList(r.items);
        setError(r.status === 'fail');
        setLoaded(true);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [sido, reload]);

  const call = (tel: string) => tel && Linking.openURL(`tel:${tel.replace(/[^0-9]/g, '')}`);

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title={t('aed_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {/* 사용법 카드 — 외국인에게 가장 중요하므로 최상단 */}
        <View style={[styles.howto, { backgroundColor: colors.card, borderLeftColor: colors.emergency }]}>
          <Text style={[typography.bodyBold, { color: colors.emergency }]}>🫀 {t('aed_howto_title')}</Text>
          <Text style={[typography.small, { color: colors.text, marginTop: 8 }]}>1. {t('aed_step1')}</Text>
          <Text style={[typography.small, { color: colors.text, marginTop: 4 }]}>2. {t('aed_step2')}</Text>
          <Text style={[typography.small, { color: colors.text, marginTop: 4 }]}>3. {t('aed_step3')}</Text>
          <Text style={[typography.captionBold, { color: colors.emergency, marginTop: 8 }]}>{t('aed_cpr')}</Text>
          <PrimaryButton
            title={t('aed_119')}
            variant="emergency"
            size="md"
            style={{ marginTop: spacing.sm }}
            onPress={() => Linking.openURL('tel:119')}
          />
        </View>

        <Text style={[typography.small, { color: colors.textSecondary, marginBottom: 8 }]}>{t('aed_lead')}</Text>

        {/* 지역 선택 */}
        <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 6 }]}>{t('aed_region')}</Text>
        <View style={styles.chips}>
          {SIDO_LIST.map((s) => (
            <Chip key={s} label={s} selected={sido === s} tone="primary" onPress={() => setSido(s)} />
          ))}
        </View>

        {/* 목록 */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : error ? (
          <LoadError onRetry={retry} />
        ) : loaded && list.length === 0 ? (
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.lg, textAlign: 'center' }]}>{t('aed_none')}</Text>
        ) : (
          list.map((a, i) => (
            <View key={`${a.addr}-${i}`} style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{a.place || a.org}</Text>
                {a.is24h && (
                  <Text style={[styles.badge24, { backgroundColor: colors.primary, color: colors.textInverse }]}>24h</Text>
                )}
              </View>
              {!!a.addr && <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2 }]}>{a.addr}</Text>}
              {!!a.org && <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>{t('aed_org')}: {a.org}</Text>}
              {!!a.tel && (
                <PrimaryButton title={`${t('aed_call')} ${a.tel}`} variant="outline" size="sm" style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }} onPress={() => call(a.tel)} />
              )}
            </View>
          ))
        )}

        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' }]}>{t('aed_source')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // 색은 렌더 시 useTheme()로 덮음 — 여기 값은 정적 기본(라이트)일 뿐
  wrap: { flex: 1, backgroundColor: _staticColors.bg },
  howto: {
    backgroundColor: _staticColors.card,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: _staticColors.emergency,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },
  card: {
    backgroundColor: _staticColors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  badge24: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: _staticColors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
});
