import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors as _staticColors, radius, spacing, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { INCIDENT_TYPES } from '../data/options';
import { firstAidFor } from '../data/firstAid';
import { IncidentType, RootStackParamList } from '../types';
import { storage } from '../services/storage';
import { useLang } from '../i18n/LanguageContext';
import { IT_KEY as TYPE_KEY } from '../i18n/optionKeys';

type Props = NativeStackScreenProps<RootStackParamList, 'IncidentReport'>;

export function IncidentReportScreen({ navigation }: Props) {
  const { lang, t } = useLang();
  const colors = useTheme();
  const [type, setType] = useState<IncidentType | null>(null);
  const [memo, setMemo] = useState('');

  const card = type ? firstAidFor(type) : null;
  const call119 = () => Linking.openURL('tel:119');

  const report = async () => {
    if (!type) return;
    await storage.addIncident({
      id: `inc_${Date.now()}`,
      type,
      locationText: '현재 위치(GPS) 자동 첨부 — 데모',
      memo: memo.trim() || undefined,
      reportedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
    Alert.alert(t('ir_sent_t'), t('ir_sent_m'), [
      { text: t('ef_find_er'), onPress: () => navigation.navigate('HospitalFinder', { kind: 'er' }) },
      { text: t('common_ok'), style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title={t('ir_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>{t('ir_q')}</Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: 6, marginBottom: spacing.md }]}>
          {t('ir_note')}
        </Text>

        <View style={styles.chips}>
          {INCIDENT_TYPES.map((ty) => (
            <Chip key={ty} label={t(TYPE_KEY[ty])} tone="red" selected={type === ty} onPress={() => setType(ty as IncidentType)} />
          ))}
        </View>

        <View style={[styles.gps, shadow.card, { backgroundColor: colors.card }]}>
          <Text style={[typography.captionBold, { color: colors.text }]}>📍 {t('ir_gps')}</Text>
          <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>{t('ir_gps_note')}</Text>
        </View>

        <TextInput
          value={memo}
          onChangeText={setMemo}
          placeholder={t('ir_memo_ph')}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          multiline
        />

        {card && (
          <View style={[styles.aidCard, shadow.card, { backgroundColor: colors.card, borderColor: colors.emergency }]}>
            <Text style={[typography.h3, { color: colors.emergency }]}>🚑 {card.title[lang]}</Text>
            {card.steps[lang].map((s, i) => (
              <View key={i} style={styles.step}>
                <View style={[styles.stepNo, { backgroundColor: colors.emergency }]}><Text style={styles.stepNoTxt}>{i + 1}</Text></View>
                <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{s}</Text>
              </View>
            ))}
            <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.sm }]}>
              {t('ir_aid_warn')}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.divider, backgroundColor: colors.bg }]}>
        <View style={styles.rowBtns}>
          <View style={{ flex: 1 }}><PrimaryButton title={t('ef_call119')} icon="📞" variant="emergency" onPress={call119} /></View>
          <View style={{ width: spacing.sm }} />
          <View style={{ flex: 1 }}>
            <PrimaryButton title={t('ef_find_er')} icon="🏥" variant="primary" onPress={() => navigation.navigate('HospitalFinder', { kind: 'er' })} />
          </View>
        </View>
        <PrimaryButton title={t('ir_send')} icon="🚨" variant="work" size="lg" disabled={!type} onPress={report} style={{ marginTop: spacing.sm }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 색은 렌더 시 useTheme()로 덮음 — 여기 값은 정적 기본(라이트)일 뿐
  wrap: { flex: 1, backgroundColor: _staticColors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  gps: { backgroundColor: _staticColors.card, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm },
  input: {
    backgroundColor: _staticColors.card,
    borderWidth: 1,
    borderColor: _staticColors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 56,
    marginTop: spacing.sm,
    ...typography.body,
    color: _staticColors.text,
  },
  aidCard: { backgroundColor: _staticColors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md, borderWidth: 1.5, borderColor: _staticColors.emergency },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.sm },
  stepNo: { width: 22, height: 22, borderRadius: 11, backgroundColor: _staticColors.emergency, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 },
  stepNoTxt: { color: '#fff', fontWeight: '800', fontSize: 12 },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: _staticColors.divider, backgroundColor: _staticColors.bg },
  rowBtns: { flexDirection: 'row' },
});
