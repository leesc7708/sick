import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { SIDO_LIST, fetchSevere, fetchTrauma, SevereHospital, TraumaCenter } from '../data/egen';

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

  // ── 중증질환 수용 가능 정보(E-Gen 실데이터) — 기존 탭과 분리된 추가 뷰 ──
  const [severeMode, setSevereMode] = useState(false);
  const [sido, setSido] = useState<string>('서울특별시');
  const [severeList, setSevereList] = useState<SevereHospital[]>([]);
  const [trauma, setTrauma] = useState<TraumaCenter[]>([]);
  const [sevLoading, setSevLoading] = useState(false);
  const [sevLoaded, setSevLoaded] = useState(false);

  useEffect(() => {
    if (!severeMode) return;
    let alive = true;
    setSevLoading(true);
    // 중증 수용가능은 시도 변경 시마다, 외상센터는 처음 한 번만 조회
    Promise.all([fetchSevere(sido), trauma.length ? Promise.resolve(trauma) : fetchTrauma()])
      .then(([sev, tr]) => {
        if (!alive) return;
        setSevereList(sev);
        if (!trauma.length) setTrauma(tr as TraumaCenter[]);
        setSevLoaded(true);
      })
      .finally(() => alive && setSevLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severeMode, sido]);

  const list = FACILITIES.filter((f) => f.kind === kind)
    .filter((f) => (dept ? f.departments.includes(dept) : true))
    .filter((f) => (openOnly ? f.isOpenNow : true))
    .filter((f) => (nightOnly ? f.hasNight : true))
    .filter((f) => (bedsOnly && kind === 'er' ? (f.availableBeds ?? 0) > 0 : true))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const call = (h: Hospital) => Linking.openURL(`tel:${h.phone}`);
  // 카카오맵 검색어 정제: 괄호 설명·응급실 접미사 제거 → 실제 장소명으로 검색
  //  (2026-07-09 길찾기 버그픽스: '울산제일병원 응급실 (화상·외상)' 등 이름 전체로 검색해 미매칭되던 문제)
  const mapQuery = (name: string) =>
    name.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s*(권역응급의료센터|지역응급의료기관|응급의료센터|응급실)\s*$/, '').replace(/\s+/g, ' ').trim() || name;
  const route2 = (h: Hospital) => Linking.openURL(`https://map.kakao.com/?q=${encodeURIComponent(mapQuery(h.name))}`);

  return (
    <View style={styles.wrap}>
      <AppBar title={t('hf_title')} onBack={() => navigation.goBack()} />

      {/* 탭은 세그먼트 컨트롤 (아래 필터 pill과 시각 분리) */}
      <View style={styles.segment}>
        {TABS.map((tab) => {
          const on = !severeMode && kind === tab.k;
          return (
            <Pressable key={tab.k} style={[styles.seg, on && styles.segOn]} onPress={() => { setSevereMode(false); setKind(tab.k); }}>
              <Text style={[styles.segTxt, on && styles.segTxtOn]}>{t(`hf_${tab.k}`)}</Text>
            </Pressable>
          );
        })}
        {/* 추가: 중증질환 수용 가능(실데이터) 뷰 전환 */}
        <Pressable style={[styles.seg, severeMode && styles.segOn]} onPress={() => setSevereMode(true)}>
          <Text style={[styles.segTxt, severeMode && styles.segTxtOn]}>{t('hf_severe')}</Text>
        </Pressable>
      </View>
      {!severeMode && (
        <View style={styles.filters}>
          <Chip label={t('hf_open')} selected={openOnly} onPress={() => setOpenOnly((v) => !v)} />
          <Chip label={t('hf_night')} selected={nightOnly} onPress={() => setNightOnly((v) => !v)} />
          {kind === 'er' && <Chip label={t('hf_beds_f')} tone="primary" selected={bedsOnly} onPress={() => setBedsOnly((v) => !v)} />}
        </View>
      )}
      {!severeMode && dept && (
        <View style={styles.filters}>
          <Chip label={`${dept} ${t('hf_dept_clear')} ✕`} tone="primary" selected onPress={() => setDept(undefined)} />
        </View>
      )}

      {severeMode ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.sm }]}>{t('sev_lead')}</Text>
          <Text style={[typography.captionBold, { color: colors.textMuted, marginBottom: 6 }]}>{t('sev_region')}</Text>
          <View style={[styles.filters, { paddingHorizontal: 0 }]}>
            {SIDO_LIST.map((s) => (
              <Chip key={s} label={s} tone="primary" selected={sido === s} onPress={() => setSido(s)} />
            ))}
          </View>

          {sevLoading && (
            <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 8 }]}>{t('sev_loading')}</Text>
            </View>
          )}

          {!sevLoading && sevLoaded && severeList.length === 0 && (
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg }]}>{t('sev_none')}</Text>
          )}

          {!sevLoading &&
            severeList.map((h) => (
              <View key={h.hpid || h.name} style={[styles.card, shadow.card]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{h.name}</Text>
                  <View style={[styles.bedBadge, { backgroundColor: h.acceptCount > 0 ? colors.success : colors.g800 }]}>
                    <Text style={styles.bedBadgeTxt}>{h.acceptCount > 0 ? `${h.acceptCount} ${t('sev_accept')}` : t('sev_no_accept')}</Text>
                  </View>
                </View>
                {h.available.length > 0 && (
                  <View style={styles.tagWrap}>
                    {h.available.slice(0, 6).map((a) => (
                      <View key={a.code} style={styles.tag}>
                        <Text style={styles.tagTxt}>{a.label}</Text>
                      </View>
                    ))}
                    {h.available.length > 6 && (
                      <Text style={[typography.small, { color: colors.textMuted, alignSelf: 'center' }]}>+{h.available.length - 6}{t('sev_more')}</Text>
                    )}
                  </View>
                )}
              </View>
            ))}

          {/* 전국 권역외상센터 */}
          {!sevLoading && trauma.length > 0 && (
            <>
              <Text style={[typography.bodyBold, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }]}>{t('sev_trauma_title')}</Text>
              {trauma.map((c) => (
                <View key={c.hpid || c.name} style={[styles.card, shadow.card]}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{c.name}</Text>
                  {!!c.addr && <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>{c.addr}</Text>}
                  <View style={styles.rowBtns}>
                    {!!(c.tel || c.erTel) && (
                      <View style={{ flex: 1 }}>
                        <PrimaryButton title={t('hf_call')} icon="📞" variant="primary" size="sm" onPress={() => Linking.openURL(`tel:${c.erTel || c.tel}`)} />
                      </View>
                    )}
                    <View style={{ width: spacing.sm }} />
                    <View style={{ flex: 1 }}>
                      <PrimaryButton title={t('hf_route')} icon="🗺️" variant="outline" size="sm" onPress={() => Linking.openURL(`https://map.kakao.com/?q=${encodeURIComponent(mapQuery(c.name))}`)} />
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}

          <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' }]}>{t('sev_notel')}</Text>
          <Text style={[typography.small, { color: colors.textMuted, marginTop: 4, textAlign: 'center' }]}>{t('sev_source')}</Text>
        </ScrollView>
      ) : (
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
      )}
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
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  tag: { backgroundColor: colors.g100, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  tagTxt: { ...typography.small, color: colors.textSecondary },
});
