import React, { useCallback, useRef, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors as _staticColors, radius, spacing, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { HEALTH_CHECK_TYPES } from '../data/options';
import { HealthCheckRecord, HealthCheckType, RootStackParamList } from '../types';
import { storage } from '../services/storage';
import { useRegisterScrollTop } from '../utils/scrollTop';
import { useLang } from '../i18n/LanguageContext';
import { healthTypeLabel, docInfoLabel, resultLabel } from '../i18n/healthDocs';

type Props = NativeStackScreenProps<RootStackParamList, 'HealthRecords'>;

function daysLeft(expire?: string): number | null {
  if (!expire) return null;
  const diff = new Date(expire).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function HealthRecordsScreen({ navigation }: Props) {
  const colors = useTheme();
  const { t, lang } = useLang();
  const [records, setRecords] = useState<HealthCheckRecord[]>([]);
  const [pickType, setPickType] = useState<HealthCheckType>('특수건강진단');
  const scrollRef = useRef<ScrollView>(null);
  const toTop = useCallback(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), []);
  useRegisterScrollTop(toTop);

  const reload = useCallback(async () => setRecords(await storage.getHealthRecords()), []);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const addRecord = async (title: string, fileType: 'pdf' | 'image', uri: string) => {
    const now = new Date();
    const examDate = now.toISOString().slice(0, 10);
    const expireDate =
      pickType === '특수건강진단'
        ? new Date(now.getTime() + 1000 * 60 * 60 * 24 * 180).toISOString().slice(0, 10)
        : undefined;
    await storage.addHealthRecord({
      id: `hc_${Date.now()}`,
      type: pickType,
      title,
      fileType,
      fileUri: uri,
      examDate,
      expireDate,
      result: pickType === '특수건강진단' ? '적합' : undefined,
      createdAt: examDate,
    });
    await reload();
  };

  const addFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    await addRecord(a.name || t('hr_default_doc'), a.mimeType?.includes('pdf') ? 'pdf' : 'image', a.uri);
  };

  const addPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert(t('hr_perm_title'), t('hr_perm_photo')); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (res.canceled || !res.assets?.[0]) return;
    await addRecord(t('hr_default_photo'), 'image', res.assets[0].uri);
  };

  const addCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert(t('hr_perm_title'), t('hr_perm_camera')); return; }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (res.canceled || !res.assets?.[0]) return;
    await addRecord(t('hr_default_shot'), 'image', res.assets[0].uri);
  };

  const onAdd = () =>
    Alert.alert(t('hr_add_fmt').replace('{t}', healthTypeLabel(pickType, lang)), t('hr_add_method_body'), [
      { text: t('hr_m_camera'), onPress: addCamera },
      { text: t('hr_m_file'), onPress: addFile },
      { text: t('hr_m_photo'), onPress: addPhoto },
      { text: t('hr_cancel'), style: 'cancel' },
    ]);

  const remove = (id: string) =>
    Alert.alert(t('hr_delete'), t('hr_del_body'), [
      { text: t('hr_cancel'), style: 'cancel' },
      { text: t('hr_delete'), style: 'destructive', onPress: async () => { await storage.deleteHealthRecord(id); reload(); } },
    ]);

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title={t('hr_appbar')} onBack={() => navigation.goBack()} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>{t('hr_hero')}</Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: 6 }]}>
          {t('hr_hero_desc')}
        </Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('hr_add_category')}</Text>
        <View style={styles.chips}>
          {HEALTH_CHECK_TYPES.map((ht) => (
            <Chip key={ht} label={healthTypeLabel(ht, lang)} tone="work" selected={pickType === ht} onPress={() => setPickType(ht as HealthCheckType)} />
          ))}
        </View>
        <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2, lineHeight: 18 }]}>ℹ️ {docInfoLabel(pickType, lang)}</Text>

        {records.length === 0 && (
          <View style={[styles.empty, shadow.card, { backgroundColor: colors.card }]}>
            <Text style={{ fontSize: 32 }}>📋</Text>
            <Text style={[typography.body, { color: colors.textMuted, marginTop: 8, textAlign: 'center' }]}>{t('hr_empty')}</Text>
          </View>
        )}

        {records.map((r) => {
          const left = daysLeft(r.expireDate);
          return (
            <View key={r.id} style={[styles.card, shadow.card, { backgroundColor: colors.card }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {r.fileType === 'image' && r.fileUri ? (
                  <Image source={{ uri: r.fileUri }} style={[styles.thumb, { backgroundColor: colors.g100 }]} />
                ) : (
                  <Text style={{ fontSize: 22, marginRight: 10 }}>{r.fileType === 'pdf' ? '📄' : '🖼️'}</Text>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{healthTypeLabel(r.type, lang)}</Text>
                  <Text style={[typography.small, { color: colors.textMuted }]} numberOfLines={1}>{r.title}</Text>
                </View>
                <Text style={[typography.small, { color: colors.textMuted }]}>{r.fileType.toUpperCase()}</Text>
              </View>

              <View style={{ flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' }}>
                {r.examDate && <Text style={[typography.small, { color: colors.textSecondary, marginRight: 10 }]}>{t('hr_exam_date')} {r.examDate}</Text>}
                {r.result && <Text style={[typography.small, { color: colors.success }]}>{resultLabel(r.result, lang)}</Text>}
              </View>
              {left !== null && (
                <Text style={[typography.small, { marginTop: 4, color: left <= 30 ? colors.warning : colors.textMuted }]}>
                  {left <= 0 ? t('hr_expired') : `${t('hr_valid_days').replace('{d}', String(left))} (~${r.expireDate})`}
                </Text>
              )}

              <View style={styles.rowBtns}>
                <View style={{ flex: 1 }}><PrimaryButton title={t('hr_qr_share')} icon="📤" variant="work" size="sm" onPress={() => navigation.navigate('HealthRecordShare', { recordId: r.id })} /></View>
                <View style={{ width: spacing.sm }} />
                <View style={{ flex: 1 }}><PrimaryButton title={t('hr_delete')} variant="ghost" size="sm" onPress={() => remove(r.id)} /></View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <PrimaryButton title={t('hr_add_fmt').replace('{t}', healthTypeLabel(pickType, lang))} icon="＋" variant="work" size="lg" onPress={onAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 색은 렌더 시 useTheme()로 덮음 — 여기 값은 정적 기본(라이트)일 뿐
  wrap: { flex: 1, backgroundColor: _staticColors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  label: { ...typography.captionBold, color: _staticColors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  empty: { backgroundColor: _staticColors.card, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', marginTop: spacing.md },
  card: { backgroundColor: _staticColors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.sm },
  thumb: { width: 38, height: 38, borderRadius: 8, marginRight: 10, backgroundColor: _staticColors.g100 },
  rowBtns: { flexDirection: 'row', marginTop: spacing.md },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: _staticColors.divider },
});
