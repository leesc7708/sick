import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { ACCOMPANYING, BODY_PARTS, WORK_TYPES } from '../data/options';
import { RootStackParamList, SymptomMemo } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'SymptomInput'>;

export function SymptomInputScreen({ navigation }: Props) {
  const [who, setWho] = useState<'self' | 'coworker'>('self');
  const [startedAt, setStartedAt] = useState('');
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [severity, setSeverity] = useState(5);
  const [accompanying, setAccompanying] = useState<string[]>([]);
  const [atWork, setAtWork] = useState(true);
  const [workType, setWorkType] = useState<string>('');
  const [concern, setConcern] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const addPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6 });
    if (res.canceled || !res.assets?.[0]) return;
    setPhotos((p) => [...p, res.assets[0].uri]);
  };

  const save = async () => {
    const id = `memo_${Date.now()}`;
    const memo: SymptomMemo = {
      id,
      who,
      startedAt: startedAt.trim() || undefined,
      bodyParts,
      severity,
      accompanying,
      atWork,
      workType: atWork ? workType || undefined : undefined,
      concern: concern.trim() || undefined,
      photos: photos.length ? photos : undefined,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    await storage.addSymptomMemo(memo);
    navigation.navigate('SymptomSummary', { memoId: id });
  };

  return (
    <View style={styles.wrap}>
      <AppBar title="증상 정리" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>누구의 증상인가요?</Text>
        <View style={styles.chips}>
          <Chip label="본인" selected={who === 'self'} onPress={() => setWho('self')} />
          <Chip label="동료" selected={who === 'coworker'} onPress={() => setWho('coworker')} />
        </View>

        <Text style={styles.label}>언제부터인가요?</Text>
        <TextInput value={startedAt} onChangeText={setStartedAt} placeholder="예: 오늘 오전 10시" placeholderTextColor={colors.g400} style={styles.input} />

        <Text style={styles.label}>어디가 불편한가요?</Text>
        <View style={styles.chips}>
          {BODY_PARTS.map((b) => <Chip key={b} label={b} selected={bodyParts.includes(b)} onPress={() => toggle(bodyParts, setBodyParts, b)} />)}
        </View>

        <Text style={styles.label}>통증 강도</Text>
        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => setSeverity((s) => Math.max(0, s - 1))}><Text style={styles.stepTxt}>−</Text></Pressable>
          <Text style={[typography.h2, { color: colors.text, width: 70, textAlign: 'center' }]}>{severity}<Text style={[typography.body, { color: colors.textMuted }]}> /10</Text></Text>
          <Pressable style={styles.stepBtn} onPress={() => setSeverity((s) => Math.min(10, s + 1))}><Text style={styles.stepTxt}>+</Text></Pressable>
        </View>

        <Text style={styles.label}>동반 증상</Text>
        <View style={styles.chips}>
          {ACCOMPANYING.map((a) => <Chip key={a} label={a} selected={accompanying.includes(a)} onPress={() => toggle(accompanying, setAccompanying, a)} />)}
        </View>

        <Text style={styles.label}>작업 중에 생긴 증상인가요?</Text>
        <View style={styles.chips}>
          <Chip label="예" tone="work" selected={atWork} onPress={() => setAtWork(true)} />
          <Chip label="아니오" selected={!atWork} onPress={() => setAtWork(false)} />
        </View>
        {atWork && (
          <View style={styles.chips}>
            {WORK_TYPES.map((w) => <Chip key={w} label={w} tone="work" selected={workType === w} onPress={() => setWorkType(w)} />)}
          </View>
        )}

        <Text style={styles.label}>걱정되는 점(선택)</Text>
        <TextInput value={concern} onChangeText={setConcern} placeholder="예: 가스를 마신 것 같아 걱정돼요" placeholderTextColor={colors.g400} style={[styles.input, { minHeight: 56 }]} multiline />

        <Text style={styles.label}>사진 첨부(선택) — 피부·상처 등</Text>
        <View style={styles.photoRow}>
          {photos.map((uri, i) => <Image key={i} source={{ uri }} style={styles.thumb} />)}
          <Pressable onPress={addPhoto} style={styles.addPhoto}><Text style={{ fontSize: 28, color: colors.g400 }}>＋</Text></Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="요약 카드 만들기" icon="📝" size="lg" onPress={save} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  label: { ...typography.captionBold, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, ...typography.body, color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 6 },
  stepBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.g100, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { fontSize: 24, fontWeight: '700', color: colors.g800 },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: colors.g100 },
  addPhoto: { width: 72, height: 72, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider },
});
