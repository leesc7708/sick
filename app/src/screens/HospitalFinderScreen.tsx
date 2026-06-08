import React, { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { Hospital, RootStackParamList } from '../types';
import { MOCK_HOSPITALS } from '../data/mockHospitals';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalFinder'>;

type SortKey = 'distance' | 'rating';

export function HospitalFinderScreen({ route }: Props) {
  const initialDepartments = route.params?.departments ?? [];
  const [sort, setSort] = useState<SortKey>('distance');
  const [openNow, setOpenNow] = useState(false);
  const [nightCare, setNightCare] = useState(false);
  const [weekend, setWeekend] = useState(false);
  const [parking, setParking] = useState(false);
  const [deptFilter, setDeptFilter] = useState<string[]>(initialDepartments);

  const allDepartments = useMemo(() => {
    const set = new Set<string>();
    MOCK_HOSPITALS.forEach((h) => h.department.forEach((d) => set.add(d)));
    return Array.from(set);
  }, []);

  const hospitals = useMemo(() => {
    let list = [...MOCK_HOSPITALS];
    if (deptFilter.length > 0) {
      list = list.filter((h) => h.department.some((d) => deptFilter.includes(d)));
    }
    if (openNow) list = list.filter((h) => h.isOpenNow);
    if (nightCare) list = list.filter((h) => h.hasNightCare);
    if (weekend) list = list.filter((h) => h.hasWeekendCare);
    if (parking) list = list.filter((h) => h.hasParking);

    list.sort((a, b) =>
      sort === 'distance' ? a.distanceKm - b.distanceKm : b.rating - a.rating,
    );
    return list;
  }, [sort, openNow, nightCare, weekend, parking, deptFilter]);

  function call(phone: string) {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('전화 연결 실패'));
  }

  function directions(h: Hospital) {
    const q = encodeURIComponent(`${h.name} ${h.address}`);
    Linking.openURL(`https://map.kakao.com/?q=${q}`).catch(() => Alert.alert('지도 열기 실패'));
  }

  function toggleDept(d: string) {
    setDeptFilter((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  return (
    <Screen>
      <Text style={[typography.h2, styles.title]}>병원 찾기</Text>
      <Text style={[typography.caption, styles.subtitle]}>
        현재 위치 정보는 데모 데이터이며, 실제 배포 시 GPS 및 심평원 API 연동이 필요합니다.
      </Text>

      <Text style={[typography.bodyBold, styles.label]}>진료과 필터</Text>
      <View style={styles.wrap}>
        {allDepartments.map((d) => (
          <Pressable
            key={d}
            style={[styles.chip, deptFilter.includes(d) && styles.chipActive]}
            onPress={() => toggleDept(d)}
          >
            <Text style={[styles.chipText, deptFilter.includes(d) && styles.chipTextActive]}>{d}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.toggle, openNow && styles.toggleActive]}
          onPress={() => setOpenNow(!openNow)}
        >
          <Text style={[styles.toggleText, openNow && styles.toggleTextActive]}>지금 영업</Text>
        </Pressable>
        <Pressable
          style={[styles.toggle, nightCare && styles.toggleActive]}
          onPress={() => setNightCare(!nightCare)}
        >
          <Text style={[styles.toggleText, nightCare && styles.toggleTextActive]}>야간진료</Text>
        </Pressable>
        <Pressable
          style={[styles.toggle, weekend && styles.toggleActive]}
          onPress={() => setWeekend(!weekend)}
        >
          <Text style={[styles.toggleText, weekend && styles.toggleTextActive]}>주말진료</Text>
        </Pressable>
        <Pressable
          style={[styles.toggle, parking && styles.toggleActive]}
          onPress={() => setParking(!parking)}
        >
          <Text style={[styles.toggleText, parking && styles.toggleTextActive]}>주차</Text>
        </Pressable>
      </View>

      <View style={styles.sortRow}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>정렬:</Text>
        <Pressable onPress={() => setSort('distance')}>
          <Text style={[styles.sortLink, sort === 'distance' && styles.sortLinkActive]}>거리순</Text>
        </Pressable>
        <Text style={{ color: colors.textMuted }}>|</Text>
        <Pressable onPress={() => setSort('rating')}>
          <Text style={[styles.sortLink, sort === 'rating' && styles.sortLinkActive]}>평점순</Text>
        </Pressable>
      </View>

      {hospitals.length === 0 ? (
        <Card>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            조건에 맞는 병원이 없습니다.
          </Text>
        </Card>
      ) : (
        hospitals.map((h) => (
          <Card key={h.id}>
            <View style={styles.hospitalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text }]}>{h.name}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {h.department.join(', ')}
                </Text>
              </View>
              {h.isOpenNow ? (
                <View style={styles.openBadge}>
                  <Text style={styles.openBadgeText}>영업중</Text>
                </View>
              ) : (
                <View style={styles.closedBadge}>
                  <Text style={styles.closedBadgeText}>영업종료</Text>
                </View>
              )}
            </View>
            <Text style={[typography.caption, styles.detail]}>📍 {h.address} ({h.distanceKm}km)</Text>
            <Text style={[typography.caption, styles.detail]}>⭐ {h.rating} ({h.reviewCount}개 리뷰)</Text>
            <Text style={[typography.caption, styles.detail]}>🕐 {h.hours}</Text>
            <Text style={[typography.caption, styles.detail]}>💰 {h.estimatedCost}</Text>
            <View style={styles.tagRow}>
              {h.hasNightCare && <Tag label="야간" />}
              {h.hasWeekendCare && <Tag label="주말" />}
              {h.hasParking && <Tag label="주차" />}
            </View>
            <View style={styles.hospitalActions}>
              <PrimaryButton title="📞 전화" variant="secondary" onPress={() => call(h.phone)} style={{ flex: 1 }} />
              <PrimaryButton
                title="🗺️ 길찾기"
                variant="primary"
                onPress={() => directions(h)}
                style={{ flex: 1, marginLeft: spacing.sm }}
              />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text },
  subtitle: { color: colors.textMuted, marginBottom: spacing.md },
  label: { color: colors.text, marginTop: spacing.sm, marginBottom: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipText: { color: colors.text, fontSize: 13 },
  chipTextActive: { color: colors.textInverse, fontWeight: '600' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  toggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  toggleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { fontSize: 12, color: colors.text },
  toggleTextActive: { color: colors.textInverse, fontWeight: '600' },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  sortLink: { color: colors.textSecondary, fontSize: 14 },
  sortLinkActive: { color: colors.primary, fontWeight: '700' },
  hospitalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs },
  openBadge: { backgroundColor: '#C8E6C9', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  openBadgeText: { fontSize: 11, color: colors.primaryDark, fontWeight: '700' },
  closedBadge: { backgroundColor: '#ECEFF1', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  closedBadgeText: { fontSize: 11, color: colors.textMuted, fontWeight: '700' },
  detail: { color: colors.textSecondary, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  tag: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  tagText: { fontSize: 11, color: colors.primaryDark, fontWeight: '600' },
  hospitalActions: { flexDirection: 'row', marginTop: spacing.md },
});
