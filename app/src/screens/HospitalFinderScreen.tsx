import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors as _staticColors, radius, spacing, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { FACILITIES } from '../data/facilities';
import { FacilityKind, Hospital, RootStackParamList } from '../types';
import { useLang } from '../i18n/LanguageContext';
import { SIDO_LIST, fetchSevere, fetchTrauma, fetchBeds, detectSido, SevereHospital, TraumaCenter, BedHospital } from '../data/egen';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalFinder'>;

const TABS: { k: FacilityKind; label: string }[] = [
  { k: 'er', label: '응급실' },
  { k: 'hospital', label: '병원' },
  { k: 'pharmacy', label: '약국' },
];

export function HospitalFinderScreen({ navigation, route }: Props) {
  const { t } = useLang();
  const colors = useTheme();
  // 진료과 상담에서 넘어온 경우: 병원 탭 + 해당 진료과 필터로 진입
  const [kind, setKind] = useState<FacilityKind>(route.params?.kind ?? (route.params?.department ? 'hospital' : 'er'));
  const [dept, setDept] = useState<string | undefined>(route.params?.department);
  const [openOnly, setOpenOnly] = useState(false);
  const [nightOnly, setNightOnly] = useState(false);
  const [bedsOnly, setBedsOnly] = useState(false);

  // ── 중증질환 수용 가능 정보(E-Gen 실데이터) — 기존 탭과 분리된 추가 뷰 ──
  const [severeMode, setSevereMode] = useState(false);
  const [sido, setSido] = useState<string>('서울특별시');
  // ── 응급실 탭: E-Gen 실시간 가용병상 실데이터(전국 지역 단위, 2026-07-09) ──
  const [beds, setBeds] = useState<BedHospital[]>([]);
  const [bedsLoading, setBedsLoading] = useState(false);
  const [bedsLoaded, setBedsLoaded] = useState(false);

  // 진입 시 GPS로 내 지역 자동선택 (응급실·중증 공용 sido, 실패/거부 시 기본값 유지)
  useEffect(() => {
    let alive = true;
    detectSido().then((s) => { if (alive && s) setSido(s); });
    return () => { alive = false; };
  }, []);
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

  // 응급실 탭(실데이터): 지역 변경마다 실시간 가용병상 조회
  useEffect(() => {
    if (severeMode || kind !== 'er') return;
    let alive = true;
    setBedsLoading(true);
    fetchBeds(sido)
      .then((r) => {
        if (!alive) return;
        setBeds(r);
        setBedsLoaded(true);
      })
      .finally(() => alive && setBedsLoading(false));
    return () => {
      alive = false;
    };
  }, [severeMode, kind, sido]);

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
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title={t('hf_title')} onBack={() => navigation.goBack()} />

      {/* 탭은 세그먼트 컨트롤 (아래 필터 pill과 시각 분리) */}
      <View style={[styles.segment, { backgroundColor: colors.g100 }]}>
        {TABS.map((tab) => {
          const on = !severeMode && kind === tab.k;
          return (
            <Pressable key={tab.k} style={[styles.seg, on && [styles.segOn, { backgroundColor: colors.card }]]} onPress={() => { setSevereMode(false); setKind(tab.k); }}>
              <Text style={[styles.segTxt, { color: colors.textMuted }, on && { color: colors.text }]}>{t(`hf_${tab.k}`)}</Text>
            </Pressable>
          );
        })}
        {/* 추가: 중증질환 수용 가능(실데이터) 뷰 전환 */}
        <Pressable style={[styles.seg, severeMode && [styles.segOn, { backgroundColor: colors.card }]]} onPress={() => setSevereMode(true)}>
          <Text style={[styles.segTxt, { color: colors.textMuted }, severeMode && { color: colors.text }]}>{t('hf_severe')}</Text>
        </Pressable>
      </View>
      {!severeMode && (
        <View style={styles.filters}>
          {/* 응급실 탭은 E-Gen 실데이터(24시간)라 개점/야간 필터 무의미 → 병상 필터만 */}
          {kind !== 'er' && <Chip label={t('hf_open')} selected={openOnly} onPress={() => setOpenOnly((v) => !v)} />}
          {kind !== 'er' && <Chip label={t('hf_night')} selected={nightOnly} onPress={() => setNightOnly((v) => !v)} />}
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
              <View key={h.hpid || h.name} style={[styles.card, shadow.card, { backgroundColor: colors.card }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{h.name}</Text>
                  <View style={[styles.bedBadge, { backgroundColor: h.acceptCount > 0 ? colors.success : colors.g500 }]}>
                    <Text style={styles.bedBadgeTxt}>{h.acceptCount > 0 ? `${h.acceptCount} ${t('sev_accept')}` : t('sev_no_accept')}</Text>
                  </View>
                </View>
                {h.available.length > 0 && (
                  <View style={styles.tagWrap}>
                    {h.available.slice(0, 6).map((a) => (
                      <View key={a.code} style={[styles.tag, { backgroundColor: colors.g100 }]}>
                        <Text style={[styles.tagTxt, { color: colors.textSecondary }]}>{a.label}</Text>
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
                <View key={c.hpid || c.name} style={[styles.card, shadow.card, { backgroundColor: colors.card }]}>
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
      ) : kind === 'er' ? (
        // ── 응급실: E-Gen 실시간 가용병상 실데이터 (전국 지역 선택) ──
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[typography.captionBold, { color: colors.textMuted, marginBottom: 6 }]}>{t('sev_region')}</Text>
          <View style={[styles.filters, { paddingHorizontal: 0 }]}>
            {SIDO_LIST.map((s) => (
              <Chip key={s} label={s} tone="primary" selected={sido === s} onPress={() => setSido(s)} />
            ))}
          </View>

          {bedsLoading && (
            <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 8 }]}>{t('sev_loading')}</Text>
            </View>
          )}

          {(() => {
            const shown = bedsOnly ? beds.filter((h) => (h.erBeds ?? 0) > 0) : beds;
            if (bedsLoading) return null;
            if (bedsLoaded && shown.length === 0) {
              return <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg }]}>{t('hf_empty')}</Text>;
            }
            return shown.map((h) => (
              <View key={h.hpid || h.name} style={[styles.card, shadow.card, { backgroundColor: colors.card }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{h.name}</Text>
                  {typeof h.erBeds === 'number' && (
                    <View style={[styles.bedBadge, { backgroundColor: h.erBeds > 0 ? colors.success : colors.emergency }]}>
                      <Text style={styles.bedBadgeTxt}>{h.erBeds > 0 ? `${t('hf_beds')} ${h.erBeds}` : t('hf_full')}</Text>
                    </View>
                  )}
                </View>
                <Text style={[typography.small, { color: colors.textMuted, marginTop: 4 }]}>{t('hf_realtime')}</Text>
                <View style={styles.rowBtns}>
                  {!!h.tel && (
                    <View style={{ flex: 1 }}>
                      <PrimaryButton title={t('hf_call')} icon="📞" variant="primary" size="sm" onPress={() => Linking.openURL(`tel:${h.tel}`)} />
                    </View>
                  )}
                  {!!h.tel && <View style={{ width: spacing.sm }} />}
                  <View style={{ flex: 1 }}>
                    <PrimaryButton title={t('hf_route')} icon="🗺️" variant="outline" size="sm" onPress={() => Linking.openURL(`https://map.kakao.com/?q=${encodeURIComponent(mapQuery(h.name))}`)} />
                  </View>
                </View>
              </View>
            ));
          })()}

          <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' }]}>{t('sev_source')}</Text>
        </ScrollView>
      ) : (
      <ScrollView contentContainerStyle={styles.content}>
        {list.length === 0 && (
          <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>{t('hf_empty')}</Text>
        )}
        {list.map((h) => (
          <View key={h.id} style={[styles.card, shadow.card, { backgroundColor: colors.card }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>{h.name}</Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>{h.distanceKm}km</Text>
            </View>

            {/* [주석보존] 응급실 병상 배지는 E-Gen 실데이터 분기(위 kind==='er')로 이동 →
                데모(병원/약국) 분기에선 도달 불가라 비활성화 (2026-07-09):
                {kind === 'er' && typeof h.availableBeds === 'number' && (
                  bedRow: availableBeds>0 ? hf_beds+수 : hf_full, +hf_realtime)} */}
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
  // 색은 렌더 시 useTheme()로 덮음 — 여기 값은 정적 기본(라이트)일 뿐
  wrap: { flex: 1, backgroundColor: _staticColors.bg },
  segment: { flexDirection: 'row', backgroundColor: _staticColors.g100, borderRadius: radius.lg, padding: 4, marginHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.sm },
  seg: { flex: 1, paddingVertical: 9, borderRadius: radius.md, alignItems: 'center' },
  segOn: { backgroundColor: _staticColors.card, ...shadow.card },
  segTxt: { ...typography.captionBold, color: _staticColors.textMuted },
  segTxtOn: { color: _staticColors.text },
  bedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  bedBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, alignSelf: 'flex-start' },
  bedBadgeTxt: { ...typography.captionBold, color: '#fff' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: { backgroundColor: _staticColors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  rowBtns: { flexDirection: 'row', marginTop: spacing.md },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  tag: { backgroundColor: _staticColors.g100, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  tagTxt: { ...typography.small, color: _staticColors.textSecondary },
});
