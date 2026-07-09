import React, { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors as _staticColors, radius, spacing, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { MyMedicine, RootStackParamList } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'MyMedicines'>;

// "08:00, 20:00" → ['08:00','20:00'] (HH:MM 유효한 것만 정규화)
function parseTimes(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .map((x) => {
      const m = x.match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return null;
      const h = Math.min(23, parseInt(m[1], 10));
      const mi = Math.min(59, parseInt(m[2], 10));
      return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
    })
    .filter(Boolean) as string[];
}

const notifSupported = Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window;

export function MyMedicinesScreen({ navigation }: Props) {
  const colors = useTheme();
  const [list, setList] = useState<MyMedicine[]>([]);
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [allergies, setAllergies] = useState('');
  const [taken, setTaken] = useState<Record<string, boolean>>({});
  const [notif, setNotif] = useState<string>(notifSupported ? Notification.permission : 'unsupported');

  const reload = useCallback(async () => {
    setList(await storage.getMyMedicines());
    setTaken(await storage.getMedTakenToday());
    const p = await storage.getProfile();
    setAllergies((p?.allergies ?? []).join(', '));
  }, []);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const add = async () => {
    if (!name.trim()) return;
    const times = parseTimes(time);
    await storage.addMyMedicine({ id: `med_${Date.now()}`, name: name.trim(), doseTime: time.trim() || undefined, times: times.length ? times : undefined });
    setName('');
    setTime('');
    reload();
  };
  const remove = async (id: string) => { await storage.deleteMyMedicine(id); reload(); };

  const toggleTaken = async (medId: string, tm: string) => {
    const key = `${medId}@${tm}`;
    await storage.setMedTaken(key, !taken[key]);
    setTaken(await storage.getMedTakenToday());
  };

  const enableNotif = async () => {
    if (!notifSupported) { Alert.alert('알림', '이 환경은 브라우저 알림을 지원하지 않아요.'); return; }
    const perm = await Notification.requestPermission();
    setNotif(perm);
    if (perm === 'granted') Alert.alert('알림 켜짐', '앱이 열려 있을 때 복약 시간에 알려드려요.\n(앱을 닫으면 알림은 오지 않아요.)');
  };

  const saveAllergies = async () => {
    const p = await storage.getProfile();
    if (!p) return;
    await storage.setProfile({ ...p, allergies: allergies.split(',').map((x) => x.trim()).filter(Boolean) });
    Alert.alert('저장됨', '알레르기 정보가 저장되었습니다.');
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title="내 복용약" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>처방·추천이 아니라 기록 도구예요. 병원·약국에서 보여주세요.</Text>

        {/* 복약 알림 켜기 (앱 열려 있을 때) */}
        <View style={[styles.card, shadow.card, { backgroundColor: colors.card, flexDirection: 'column', alignItems: 'stretch' }]}>
          <Text style={[typography.bodyBold, { color: colors.text }]}>🔔 복약 알림</Text>
          <Text style={[typography.small, { color: colors.textMuted, marginTop: 4 }]}>
            {notif === 'granted' ? '켜짐 — 앱이 열려 있을 때 복약 시간에 알려드려요.'
              : notif === 'unsupported' ? '이 환경은 브라우저 알림 미지원.'
              : '앱이 열려 있을 때 복약 시간에 알려드려요. (앱을 닫으면 알림은 오지 않아요.)'}
          </Text>
          {notif !== 'granted' && notif !== 'unsupported' && (
            <PrimaryButton title="알림 켜기" icon="🔔" variant="outline" size="sm" onPress={enableNotif} style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }} />
          )}
        </View>

        {list.map((m) => (
          <View key={m.id} style={[styles.card, shadow.card, { backgroundColor: colors.card, flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>💊</Text>
              <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{m.name}</Text>
              <Text onPress={() => remove(m.id)} style={[typography.caption, { color: colors.emergency }]}>삭제</Text>
            </View>
            {m.times && m.times.length > 0 ? (
              <>
                <Text style={[typography.small, { color: colors.textMuted, marginTop: 8 }]}>오늘 복용 체크</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 8 }}>
                  {m.times.map((tm) => {
                    const done = !!taken[`${m.id}@${tm}`];
                    return (
                      <Pressable
                        key={tm}
                        onPress={() => toggleTaken(m.id, tm)}
                        accessibilityRole="button"
                        accessibilityState={{ checked: done }}
                        style={[styles.timeChip, { backgroundColor: done ? colors.success : colors.g100, borderColor: done ? colors.success : colors.border }]}
                      >
                        <Text style={{ color: done ? '#fff' : colors.textSecondary, fontSize: 13, fontWeight: '700' }}>{done ? '✓ ' : ''}{tm}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : m.doseTime ? (
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>복용 {m.doseTime}</Text>
            ) : null}
          </View>
        ))}

        <View style={[styles.addBox, shadow.card, { backgroundColor: colors.card }]}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>약 추가</Text>
          <TextInput value={name} onChangeText={setName} placeholder="약 이름 (예: 혈압약)" placeholderTextColor={colors.g500} style={[styles.input, { backgroundColor: colors.g50, borderColor: colors.border, color: colors.text }]} />
          <TextInput value={time} onChangeText={setTime} placeholder="복약 시간 HH:MM (여러 개는 쉼표, 예: 08:00, 20:00)" placeholderTextColor={colors.g500} style={[styles.input, { marginTop: spacing.sm, backgroundColor: colors.g50, borderColor: colors.border, color: colors.text }]} />
          <PrimaryButton title="추가" icon="＋" variant="primary" onPress={add} style={{ marginTop: spacing.sm }} />
        </View>

        <View style={[styles.addBox, shadow.card, { backgroundColor: colors.card }]}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>알레르기 메모</Text>
          <TextInput value={allergies} onChangeText={setAllergies} placeholder="예: 페니실린, 아스피린" placeholderTextColor={colors.g500} style={[styles.input, { backgroundColor: colors.g50, borderColor: colors.border, color: colors.text }]} />
          <PrimaryButton title="알레르기 저장" variant="outline" onPress={saveAllergies} style={{ marginTop: spacing.sm }} />
        </View>

        <View style={[styles.v15, shadow.card, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>v1.5 예정</Text>
          <Text style={[typography.caption, { color: colors.text, marginTop: 4 }]}>식약처 e약은요로 효능·주의사항·상호작용을 조회합니다. (판정이 아닌 정보 제공, 약사 상담 안내)</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.divider, backgroundColor: colors.bg }]}>
        <PrimaryButton title="병원·약국에 보여줄 목록" icon="🏥" variant="outline" onPress={() => navigation.navigate('HospitalFinder', { kind: 'pharmacy' })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 색은 렌더 시 useTheme()로 덮음 — 여기 값은 정적 기본(라이트)일 뿐
  wrap: { flex: 1, backgroundColor: _staticColors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: { backgroundColor: _staticColors.card, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center' },
  timeChip: { borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  addBox: { backgroundColor: _staticColors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.lg },
  input: { backgroundColor: _staticColors.g50, borderWidth: 1, borderColor: _staticColors.border, borderRadius: radius.lg, padding: spacing.md, ...typography.body, color: _staticColors.text },
  v15: { backgroundColor: _staticColors.primaryLight, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg, borderWidth: 1, borderColor: _staticColors.border },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: _staticColors.divider },
});
