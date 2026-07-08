import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { FACILITIES } from '../data/facilities';
import { FacilityKind, Hospital, RootStackParamList } from '../types';
import { useLang } from '../i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalFinder'>;

const TABS: { k: FacilityKind; label: string }[] = [
  { k: 'er', label: '응급실' },
  { k: 'hospital', label: '병원' },
  { k: 'pharmacy', label: '약국' },
];

export function HospitalFinderScreen({ navigation, route }: Props) {
  const { t } = useLang();
  // 진료과 상담에서 넘어온 경우: 병원 탭 + 해당 진료과 필터로 진입
  const [kind, setKind] = useState<FacilityKind>(route.params?.kind ?? (route.params?.department ? 'hospital' : 'er'));
  const [dept, setDept] = useState<string | undefined>(route.params?.department);
  const [openOnly, setOpenOnly] = useState(false);
  const [nightOnly, setNightOnly] = useState(false);
  const [bedsOnly, setBedsOnly] = useState(false);

  const list = FACILITIES.filter((f) => f.kind === kind)
    .filter((f) => (dept ? f.departments.includes(dept) : true))
    .filter((f) => (openOnly ? f.isOpenNow : true))
    .filter((f) => (nightOnly ? f.hasNight : true))
    .filter((f) => (bedsOnly && kind === 'er' ? (f.availableBeds ?? 0) > 0 : true))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const call = (h: Hospital) => Linking.openURL(`tel:${h.phone}`);
  const route2 = (h: Hospital) => Linking.openURL(`https://map.kakao.com/?q=${encodeURIComponent(h.name)}`);

  return (
    <View style={styles.wrap}>
      <AppBar title={t('hf_title')} onBack={() => navigation.goBack()} />

      {/* 탭은 세그먼트 컨트롤 (아래 필터 pill과 시각 분리) */}
      <View style={styles.segment}>
        {TABS.map((tab) => {
          const on = kind === tab.k;
          return (
            <Pressable key={tab.k} style={[styles.seg, on && styles.segOn]} onPress={() => setKind(tab.k)}>
              <Text style={[styles.segTxt, on && styles.segTxtOn]}>{t(`hf_${tab.k}`)}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.filters}>
        <Chip label={t('hf_open')} selected={openOnly} onPress={() => setOpenOnly((v) => !v)} />
        <Chip label={t('hf_night')} selected={nightOnly} onPress={() => setNightOnly((v) => !v)} />
        {kind === 'er' && <Chip label={t('hf_beds_f')} tone="primary" selected={bedsOnly} onPress={() => setBedsOnly((v) => !v)} />}
      </View>
      {dept && (
        <View style={styles.filters}>
          <Chip label={`${dept} ${t('hf_dept_clear')} ✕`} tone="primary" selected onPress={() => setDept(undefined)} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {list.length === 0 && (
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>{t('hf_empty')}</Text>
        )}
        {list.map((h) => (
          <View key={h.id} style={[styles.card, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{h.name}</Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>{h.distanceKm}km</Text>
            </View>

            {kind === 'er' && typeof h.availableBeds === 'number' && (
              <View style={styles.bedRow}>
                <View style={[styles.bedBadge, { backgroundColor: h.availableBeds > 0 ? colors.success : colors.emergency }]}>
                  <Text style={styles.bedBadgeTxt}>
                    {h.availableBeds > 0 ? `${t('hf_beds')} ${h.availableBeds}` : t('hf_full')}
                  </Text>
                </View>
                {h.availableBeds > 0 && (
                  <Text style={[typography.small, { color: colors.textMuted }]}>{t('hf_realtime')}</Text>
                )}
              </View>
            )}
            {h.departments.length > 0 && (
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>{h.departments.join(' · ')}{h.isOpenNow ? ` · ${t('hf_open_now')}` : ''}</Text>
            )}

            <View style={styles.rowBtns}>
              <View style={{ flex: 1 }}><PrimaryButton title={t('hf_call')} icon="📞" variant="primary" size="sm" onPress={() => call(h)} /></View>
              <View style={{ width: spacing.sm }} />
              <View style={{ flex: 1 }}><PrimaryButton title={t('hf_route')} icon="🗺️" variant="outline" size="sm" onPress={() => route2(h)} /></View>
            </View>
          </View>
        ))}

        <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' }]}>
          {t('hf_source')}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  segment: { flexDirection: 'row', backgroundColor: colors.g100, borderRadius: radius.lg, padding: 4, marginHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.sm },
  seg: { flex: 1, paddingVertical: 9, borderRadius: radius.md, alignItems: 'center' },
  segOn: { backgroundColor: colors.card, ...shadow.card },
  segTxt: { ...typography.captionBold, color: colors.textMuted },
  segTxtOn: { color: colors.text },
  bedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  bedBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, alignSelf: 'flex-start' },
  bedBadgeTxt: { ...typography.captionBold, color: '#fff' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  rowBtns: { flexDirection: 'row', marginTop: spacing.md },
});
