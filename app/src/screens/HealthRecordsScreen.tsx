import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { DOC_INFO, HEALTH_CHECK_TYPES } from '../data/options';
import { HealthCheckRecord, HealthCheckType, RootStackParamList } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'HealthRecords'>;

function daysLeft(expire?: string): number | null {
  if (!expire) return null;
  const diff = new Date(expire).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function HealthRecordsScreen({ navigation }: Props) {
  const [records, setRecords] = useState<HealthCheckRecord[]>([]);
  const [pickType, setPickType] = useState<HealthCheckType>('특수건강진단');

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
    await addRecord(a.name || '검진결과', a.mimeType?.includes('pdf') ? 'pdf' : 'image', a.uri);
  };

  const addPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('권한 필요', '사진 접근 권한을 허용해 주세요.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (res.canceled || !res.assets?.[0]) return;
    await addRecord('검진결과 사진', 'image', res.assets[0].uri);
  };

  const addCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('권한 필요', '카메라 권한을 허용해 주세요.'); return; }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (res.canceled || !res.assets?.[0]) return;
    await addRecord('검진결과 촬영', 'image', res.assets[0].uri);
  };

  const onAdd = () =>
    Alert.alert(`'${pickType}' 추가`, '추가할 방법을 선택하세요', [
      { text: '카메라 촬영', onPress: addCamera },
      { text: 'PDF·파일 선택', onPress: addFile },
      { text: '사진 보관함', onPress: addPhoto },
      { text: '취소', style: 'cancel' },
    ]);

  const remove = (id: string) =>
    Alert.alert('삭제', '이 기록을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => { await storage.deleteHealthRecord(id); reload(); } },
    ]);

  return (
    <View style={styles.wrap}>
      <AppBar title="현장 서류함" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.h2, { color: colors.text }]}>한 번 올려두면{'\n'}어디서든 제출</Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: 6 }]}>
          현장 입구에서 QR로 바로 보여줄 수 있어요. 민감 정보라 기기에 안전하게 보관됩니다.
        </Text>

        <Text style={styles.label}>추가할 분류</Text>
        <View style={styles.chips}>
          {HEALTH_CHECK_TYPES.map((t) => (
            <Chip key={t} label={t} tone="work" selected={pickType === t} onPress={() => setPickType(t as HealthCheckType)} />
          ))}
        </View>
        <Text style={[typography.small, { color: colors.textSecondary, marginTop: 2, lineHeight: 18 }]}>ℹ️ {DOC_INFO[pickType]}</Text>

        {records.length === 0 && (
          <View style={[styles.empty, shadow.card]}>
            <Text style={{ fontSize: 32 }}>📋</Text>
            <Text style={[typography.body, { color: colors.textMuted, marginTop: 8, textAlign: 'center' }]}>아직 등록된 검진기록이 없어요.{'\n'}아래에서 추가해 보세요.</Text>
          </View>
        )}

        {records.map((r) => {
          const left = daysLeft(r.expireDate);
          return (
            <View key={r.id} style={[styles.card, shadow.card]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {r.fileType === 'image' && r.fileUri ? (
                  <Image source={{ uri: r.fileUri }} style={styles.thumb} />
                ) : (
                  <Text style={{ fontSize: 22, marginRight: 10 }}>{r.fileType === 'pdf' ? '📄' : '🖼️'}</Text>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{r.type}</Text>
                  <Text style={[typography.small, { color: colors.textMuted }]} numberOfLines={1}>{r.title}</Text>
                </View>
                <Text style={[typography.small, { color: colors.g400 }]}>{r.fileType.toUpperCase()}</Text>
              </View>

              <View style={{ flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' }}>
                {r.examDate && <Text style={[typography.small, { color: colors.textSecondary, marginRight: 10 }]}>검진일 {r.examDate}</Text>}
                {r.result && <Text style={[typography.small, { color: colors.success }]}>{r.result}</Text>}
              </View>
              {left !== null && (
                <Text style={[typography.small, { marginTop: 4, color: left <= 30 ? colors.warning : colors.textMuted }]}>
                  {left <= 0 ? '⚠️ 유효기간 만료됨' : `유효기간 ${left}일 남음 (~${r.expireDate})`}
                </Text>
              )}

              <View style={styles.rowBtns}>
                <View style={{ flex: 1 }}><PrimaryButton title="QR 공유" icon="📤" variant="work" size="sm" onPress={() => navigation.navigate('HealthRecordShare', { recordId: r.id })} /></View>
                <View style={{ width: spacing.sm }} />
                <View style={{ flex: 1 }}><PrimaryButton title="삭제" variant="ghost" size="sm" onPress={() => remove(r.id)} /></View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title={`${pickType} 추가`} icon="＋" variant="work" size="lg" onPress={onAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  label: { ...typography.captionBold, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  empty: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', marginTop: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.sm },
  thumb: { width: 38, height: 38, borderRadius: 8, marginRight: 10, backgroundColor: colors.g100 },
  rowBtns: { flexDirection: 'row', marginTop: spacing.md },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
});
