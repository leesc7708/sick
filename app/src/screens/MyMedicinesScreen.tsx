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
import { useLang } from '../i18n/LanguageContext';

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
  const { t } = useLang();
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
    if (!notifSupported) { Alert.alert(t('common_notice'), t('mm_notif_unsup_m')); return; }
    const perm = await Notification.requestPermission();
    setNotif(perm);
    if (perm === 'granted') Alert.alert(t('mm_notif_on_t'), t('mm_notif_on_m'));
  };

  const saveAllergies = async () => {
    const p = await storage.getProfile();
    if (!p) return;
    await storage.setProfile({ ...p, allergies: allergies.split(',').map((x) => x.trim()).filter(Boolean) });
    Alert.alert(t('mm_saved_t'), t('mm_saved_m'));
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title={t('mm_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{t('mm_note')}</Text>

        {/* 복약 알림 켜기 (앱 열려 있을 때) */}
        <View style={[styles.card, shadow.card, { backgroundColor: colors.card, flexDirection: 'column', alignItems: 'stretch' }]}>
          <Text style={[typography.bodyBold, { color: colors.text }]}>{t('mm_notif_t')}</Text>
          <Text style={[typography.small, { color: colors.textMuted, marginTop: 4 }]}>
            {notif === 'granted' ? t('mm_notif_on')
              : notif === 'unsupported' ? t('mm_notif_unsup')
              : t('mm_notif_off')}
          </Text>
          {notif !== 'granted' && notif !== 'unsupported' && (
            <PrimaryButton title={t('mm_notif_btn')} icon="🔔" variant="outline" size="sm" onPress={enableNotif} style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }} />
          )}
        </View>

        {list.map((m) => (
          <View key={m.id} style={[styles.card, shadow.card, { backgroundColor: colors.card, flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>💊</Text>
              <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{m.name}</Text>
              <Text onPress={() => remove(m.id)} style={[typography.caption, { color: colors.emergency }]}>{t('common_del')}</Text>
            </View>
            {m.times && m.times.length > 0 ? (
              <>
                <Text style={[typography.small, { color: colors.textMuted, marginTop: 8 }]}>{t('mm_today')}</Text>
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
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>{t('mm_dose_at')} {m.doseTime}</Text>
            ) : null}
          </View>
        ))}

        <View style={[styles.addBox, shadow.card, { backgroundColor: colors.card }]}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>{t('mm_add_t')}</Text>
          <TextInput value={name} onChangeText={setName} placeholder={t('mm_name_ph')} placeholderTextColor={colors.g500} style={[styles.input, { backgroundColor: colors.g50, borderColor: colors.border, color: colors.text }]} />
          <TextInput value={time} onChangeText={setTime} placeholder={t('mm_time_ph')} placeholderTextColor={colors.g500} style={[styles.input, { marginTop: spacing.sm, backgroundColor: colors.g50, borderColor: colors.border, color: colors.text }]} />
          <PrimaryButton title={t('mm_add')} icon="＋" variant="primary" onPress={add} style={{ marginTop: spacing.sm }} />
        </View>

        <View style={[styles.addBox, shadow.card, { backgroundColor: colors.card }]}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>{t('mm_alg_t')}</Text>
          <TextInput value={allergies} onChangeText={setAllergies} placeholder={t('mm_alg_ph')} placeholderTextColor={colors.g500} style={[styles.input, { backgroundColor: colors.g50, borderColor: colors.border, color: colors.text }]} />
          <PrimaryButton title={t('mm_alg_save')} variant="outline" onPress={saveAllergies} style={{ marginTop: spacing.sm }} />
        </View>

        <View style={[styles.v15, shadow.card, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>{t('mm_v15_t')}</Text>
          <Text style={[typography.caption, { color: colors.text, marginTop: 4 }]}>{t('mm_v15_m')}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.divider, backgroundColor: colors.bg }]}>
        <PrimaryButton title={t('mm_show')} icon="🏥" variant="outline" onPress={() => navigation.navigate('HospitalFinder', { kind: 'pharmacy' })} />
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
