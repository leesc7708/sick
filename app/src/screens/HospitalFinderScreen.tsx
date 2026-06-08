import React, { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { FACILITIES } from '../data/facilities';
import { FacilityKind, Hospital, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalFinder'>;

const TABS: { k: FacilityKind; label: string }[] = [
  { k: 'er', label: '응급실' },
  { k: 'hospital', label: '병원' },
  { k: 'pharmacy', label: '약국' },
];

export function HospitalFinderScreen({ navigation, route }: Props) {
  const [kind, setKind] = useState<FacilityKind>(route.params?.kind ?? 'er');
  const [openOnly, setOpenOnly] = useState(false);
  const [nightOnly, setNightOnly] = useState(false);
  const [bedsOnly, setBedsOnly] = useState(false);

  const list = FACILITIES.filter((f) => f.kind === kind)
    .filter((f) => (openOnly ? f.isOpenNow : true))
    .filter((f) => (nightOnly ? f.hasNight : true))
    .filter((f) => (bedsOnly && kind === 'er' ? (f.availableBeds ?? 0) > 0 : true))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const call = (h: Hospital) => Linking.openURL(`tel:${h.phone}`);
  const route2 = (h: Hospital) => Linking.openURL(`https://map.kakao.com/?q=${encodeURIComponent(h.name)}`);

  return (
    <View style={styles.wrap}>
      <AppBar title="병원·약국·응급실" onBack={() => navigation.goBack()} />

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Chip key={t.k} label={t.label} tone="primary" selected={kind === t.k} onPress={() => setKind(t.k)} />
        ))}
      </View>
      <View style={styles.filters}>
        <Chip label="지금 운영중" selected={openOnly} onPress={() => setOpenOnly((v) => !v)} />
        <Chip label="야간·주말" selected={nightOnly} onPress={() => setNightOnly((v) => !v)} />
        {kind === 'er' && <Chip label="가용병상 있음" tone="primary" selected={bedsOnly} onPress={() => setBedsOnly((v) => !v)} />}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {list.length === 0 && (
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>조건에 맞는 곳이 없어요. 필터를 조정해 보세요.</Text>
        )}
        {list.map((h) => (
          <View key={h.id} style={[styles.card, shadow.card]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{h.name}</Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>{h.distanceKm}km</Text>
            </View>

            {kind === 'er' && typeof h.availableBeds === 'number' && (
              <Text style={[typography.captionBold, { marginTop: 4, color: h.availableBeds > 0 ? colors.success : colors.emergency }]}>
                {h.availableBeds > 0 ? `🟢 가용병상 ${h.availableBeds} (실시간)` : '🔴 병상 만실'}
              </Text>
            )}
            {h.departments.length > 0 && (
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>{h.departments.join(' · ')}{h.isOpenNow ? ' · 운영중' : ''}</Text>
            )}

            <View style={styles.rowBtns}>
              <View style={{ flex: 1 }}><PrimaryButton title="전화" icon="📞" variant="primary" size="sm" onPress={() => call(h)} /></View>
              <View style={{ width: spacing.sm }} />
              <View style={{ flex: 1 }}><PrimaryButton title="길찾기" icon="🗺️" variant="outline" size="sm" onPress={() => route2(h)} /></View>
            </View>
          </View>
        ))}

        <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' }]}>
          출처: 국립중앙의료원 E-Gen(데모 데이터) · 운영시간은 방문 전 전화로 확인하세요
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingTop: spacing.md },
  filters: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm },
  rowBtns: { flexDirection: 'row', marginTop: spacing.md },
});
