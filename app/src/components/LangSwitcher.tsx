import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { LANGS } from '../i18n/translations';
import { useLang } from '../i18n/LanguageContext';

// 외국인 근로자가 첫 진입·홈에서 즉시 자기 언어를 고를 수 있게 하는 가로 스크롤 언어 선택기
export function LangSwitcher({ style }: { style?: any }) {
  const { lang, setLang } = useLang();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={style}
    >
      {LANGS.map((l) => {
        const on = lang === l.code;
        return (
          <Pressable key={l.code} onPress={() => setLang(l.code)} style={[styles.chip, on && styles.chipOn]}>
            <Text style={styles.flag}>{l.flag}</Text>
            <Text style={[styles.label, on && styles.labelOn]}>{l.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 2, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  flag: { fontSize: 16, marginRight: 6 },
  label: { ...typography.caption, color: colors.textSecondary },
  labelOn: { color: colors.primary, fontWeight: '700' },
});
