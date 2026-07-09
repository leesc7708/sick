import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors as _staticColors, radius, spacing } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { LANGS } from '../i18n/translations';
import { useLang } from '../i18n/LanguageContext';

// 외국인 근로자가 첫 진입·홈에서 즉시 자기 언어를 고를 수 있게 하는 가로 스크롤 언어 선택기
export function LangSwitcher({ style }: { style?: any }) {
  const colors = useTheme();
  const { lang, setLang } = useLang();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={[styles.wrap, style]}
    >
      {LANGS.map((l) => {
        const on = lang === l.code;
        return (
          <Pressable key={l.code} onPress={() => setLang(l.code)} style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }, on && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Text style={styles.flag}>{l.flag}</Text>
            <Text style={[styles.label, on && styles.labelOn, { color: on ? colors.primary : colors.textSecondary }]}>{l.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 0, alignSelf: 'stretch' }, // 가로 스크롤러가 부모 중앙정렬 시 세로로 늘어나는 것 방지
  row: { paddingVertical: 2, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    backgroundColor: _staticColors.card,
    borderWidth: 1.5,
    borderColor: _staticColors.border,
  },
  chipOn: { backgroundColor: _staticColors.primaryLight, borderColor: _staticColors.primary },
  flag: { fontSize: 16, marginRight: 6 },
  label: { ...typography.caption, color: _staticColors.textSecondary },
  labelOn: { color: _staticColors.primary, fontWeight: '700' },
});
