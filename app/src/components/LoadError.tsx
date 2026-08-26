import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { radius, spacing } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { useLang } from '../i18n/LanguageContext';

// ─────────────────────────────────────────────────────────────
// 실데이터 조회 "실패" 안내 카드 — "결과 0건"과 절대 같은 화면을 쓰지 않는다.
//  2026-08-26 장애 교훈: 결제 중단으로 /api/egen-* 프록시가 11일간 503이었는데
//  모든 fetch가 실패를 빈 배열로 삼켜 "조건에 맞는 곳이 없어요"만 떴고,
//  그래서 11일 동안 아무도 장애를 눈치채지 못했다.
//  응급 상황용 앱이므로 실패 시 119 안내를 함께 띄운다.
// ─────────────────────────────────────────────────────────────
export function LoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useLang();
  const colors = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: colors.card, borderLeftColor: colors.emergency }]}>
      <Text style={[typography.bodyBold, { color: colors.emergency }]}>⚠️ {t('net_fail_title')}</Text>
      <Text style={[typography.small, { color: colors.textSecondary, marginTop: 6 }]}>{t('net_fail_desc')}</Text>
      <Text style={[typography.captionBold, { color: colors.emergency, marginTop: 8 }]}>{t('net_fail_119')}</Text>
      <PrimaryButton
        title={t('net_retry')}
        icon="🔄"
        variant="outline"
        size="sm"
        style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
        onPress={onRetry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
});
