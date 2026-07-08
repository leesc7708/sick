import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types';
import { useLang } from '../i18n/LanguageContext';
import { getPolicy } from '../data/privacyPolicy';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

export function PrivacyPolicyScreen({ navigation }: Props) {
  const { lang, t } = useLang();
  const p = getPolicy(lang);

  return (
    <View style={styles.wrap}>
      <AppBar title={t('privacy_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>{p.title}</Text>
        <Text style={[typography.small, { color: colors.textMuted, marginTop: 4 }]}>{p.updated}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>{p.intro}</Text>

        {p.sections.map((s) => (
          <View key={s.h} style={[styles.card, shadow.card]}>
            <Text style={[typography.bodyBold, { color: colors.text }]}>{s.h}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 6, lineHeight: 20 }]}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm },
});
