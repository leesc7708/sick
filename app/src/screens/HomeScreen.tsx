import React, { useCallback, useRef, useState } from 'react';
import { Alert as RNAlert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ListTile } from '../components/ListTile';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { Tag } from '../components/Tag';
import { Icon } from '../components/Icon';
import { LogoMark } from '../components/LogoMark';
import { LangSwitcher } from '../components/LangSwitcher';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppMode, RootStackParamList } from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../auth/AuthContext';
import { Role, isManager, isSsvisor } from '../services/auth';
import { getMyMembership, sendEmergency, Membership } from '../services/crew';
import { useRegisterScrollTop, fabStore } from '../utils/scrollTop';
import { useLang } from '../i18n/LanguageContext';
import type { Lang } from '../i18n/translations';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const ROLE_LABEL: Record<Role, string> = {
  general: '일반사용자', worker: '근로자', svisor: '에스바이저', ssvisor: '떠블에스바이저',
};

// 홈 섹션 라벨 (다국어) — 롱리스트를 3그룹으로 구분
const SEC: Record<'care' | 'work' | 'records', Record<Lang, string>> = {
  care: { ko: '건강·응급', en: 'Health & Emergency', zh: '健康·急救', ja: '健康・救急', vi: 'Sức khỏe & Khẩn cấp', th: 'สุขภาพ·ฉุกเฉิน', es: 'Salud y Emergencia' },
  work: { ko: '현장 @work', en: 'On-site @work', zh: '现场 @work', ja: '現場 @work', vi: 'Công trường @work', th: 'หน้างาน @work', es: 'En obra @work' },
  records: { ko: '내 기록·설정', en: 'Records & Settings', zh: '我的记录·设置', ja: '記録・設定', vi: 'Hồ sơ & Cài đặt', th: 'บันทึก·ตั้งค่า', es: 'Registros y Ajustes' },
};

export function HomeScreen({ navigation }: Props) {
  const [mode, setMode] = useState<AppMode>('work');
  const { account } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const { t, lang } = useLang();
  const mgr = isManager(account);
  const scrollRef = useRef<ScrollView>(null);
  const toTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  useRegisterScrollTop(toTop);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const p = await storage.getProfile();
        // 구버전 프로필(mode 없음)은 현장 모드로 폴백
        setMode(p?.mode === 'general' ? 'general' : 'work');
        if (account && account.role === 'worker') {
          try { setMembership(await getMyMembership(account.uid)); } catch { setMembership(null); }
        }
      })();
    }, [account]),
  );

  const emergency = async () => {
    if (!account) return;
    const r = await sendEmergency(account, membership);
    if (r === 'no-crew') RNAlert.alert('현장 그룹 없음', '오늘 배정된 그룹이 없어 관리자에게 직접 전송할 수 없습니다. 119로 연락하세요.');
    else RNAlert.alert('전송됨', '관리자에게 긴급 알림을 보냈습니다.');
  };

  const changeMode = async (m: AppMode) => {
    setMode(m);
    const p = await storage.getProfile();
    await storage.setProfile({
      mode: m,
      age: p?.age,
      gender: p?.gender,
      conditions: p?.conditions ?? [],
      allergies: p?.allergies ?? [],
      currentMedicines: p?.currentMedicines ?? [],
      onboardingDone: true,
    });
  };
  const isWork = mode === 'work';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        scrollEventThrottle={16}
        onScroll={(e) => fabStore.onScroll(e.nativeEvent.contentOffset.y)}
      >
        <View style={styles.header}>
          <LogoMark size={38} />
          <View style={{ marginLeft: 10 }}>
            <Text style={[typography.h1, { color: colors.text }]}>
              라이프라인 {isWork && <Text style={{ color: colors.work }}>@work</Text>}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {isWork ? t('tagline_work') : t('tagline_general')}
            </Text>
          </View>
        </View>

        {account && (
          <View style={styles.greet}>
            <Icon name="user" size={17} color={colors.g600} />
            <Text style={[typography.bodyBold, { color: colors.text, marginLeft: 6 }]}>{account.name}님</Text>
            <Text style={[typography.small, { color: account.status === 'active' ? colors.primary : colors.warning, marginLeft: 8 }]}>
              {ROLE_LABEL[account.role]}{account.status !== 'active' ? ' · 승인대기' : ''}
            </Text>
          </View>
        )}

        <LangSwitcher style={{ marginBottom: spacing.sm }} />

        {/* 워커: 오늘 소속 그룹 + 관리자에게 긴급 */}
        {account?.role === 'worker' && (
          <View style={styles.crewBanner}>
            {membership ? (
              <>
                <Text style={[typography.captionBold, { color: colors.work }]}>오늘 소속: {membership.label}</Text>
                <Text style={[typography.small, { color: colors.textMuted, marginTop: 2 }]}>관리자: {membership.ownerName}</Text>
                <View style={{ marginTop: spacing.sm }}>
                  <PrimaryButton title="관리자에게 긴급 알림" icon="🚨" variant="work" onPress={emergency} />
                </View>
              </>
            ) : (
              <Text style={[typography.small, { color: colors.textMuted }]}>오늘 배정된 현장 그룹이 없습니다. 긴급 시 119.</Text>
            )}
          </View>
        )}

        {/* 관리자(에스바이저/떠블에스바이저): 현장 그룹 관리 */}
        {mgr && (
          <PrimaryButton title="현장 그룹 · 긴급 관리" icon="📊" variant="work" size="lg" style={{ marginBottom: spacing.sm }} onPress={() => navigation.navigate('Crew')} />
        )}

        {/* 총괄(떠블에스바이저): 회원 승인·역할 배정 */}
        {isSsvisor(account) && (
          <PrimaryButton title="회원 승인 · 역할 관리" icon="👥" variant="primary" size="md" style={{ marginBottom: spacing.sm }} onPress={() => navigation.navigate('UserAdmin')} />
        )}

        {/* 생명 직결: 119만 유일한 loud CTA(빨강). 응급신호 확인은 outline으로 위계 낮춤 */}
        <PrimaryButton title="119 즉시 전화" icon="📞" variant="emergency" size="lg" style={styles.call119} onPress={() => Linking.openURL('tel:119')} />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton title={t('emergency_check')} icon="🚨" variant="outline" size="md" onPress={() => navigation.navigate('RedFlag')} />

        {/* 모드 토글 — 세그먼트 컨트롤(회색 트랙 + 흰 선택칩). 주황 solid 막대 제거 */}
        <View style={styles.segment}>
          {([['work', t('mode_work')], ['general', t('mode_general')]] as [AppMode, string][]).map(([key, label]) => {
            const on = (key === 'work') === isWork;
            return (
              <Pressable key={key} onPress={() => changeMode(key)} style={[styles.segItem, on && styles.segItemOn]}>
                <Text style={[styles.segTxt, { color: on ? colors.text : colors.textMuted }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* 건강·응급 */}
        <Text style={styles.sectionLabel}>{SEC.care[lang]}</Text>
        <ListTile icon="📝" title={t('symptom_organize')} desc={t('symptom_desc')}
          onPress={() => navigation.navigate('SymptomInput')} />
        <ListTile icon="🗣️" title={t('phrasebook_title')} desc={t('phrasebook_desc')}
          badge={<Tag label="NEW" tone="new" />}
          onPress={() => navigation.navigate('Phrasebook')} />
        <ListTile icon="🩺" title={t('dept_consult')} desc={t('dept_consult_desc')}
          badge={<Tag label="NEW" tone="new" />}
          onPress={() => navigation.navigate('DeptConsult')} />
        <ListTile icon="🏥" title={t('find_hospital')} desc={t('find_hospital_desc')}
          onPress={() => navigation.navigate('HospitalFinder')} />

        {/* 현장 @work */}
        {isWork && (
          <>
            <Text style={styles.sectionLabel}>{SEC.work[lang]}</Text>
            <ListTile icon="⚠️" title={t('incident_report')} desc={t('incident_desc')} tone="emergency"
              badge={<Tag label="@work" tone="work" />}
              onPress={() => navigation.navigate('IncidentReport')} />
            <ListTile icon="✅" title={t('workcheck')} desc={t('workcheck_desc')} tone="work"
              badge={<Tag label="@work" tone="work" />}
              onPress={() => navigation.navigate('WorkCheck')} />
            <ListTile icon="📋" title={t('docs')} desc={t('docs_desc')} tone="work"
              badge={<Tag label="NEW" tone="new" />}
              onPress={() => navigation.navigate('HealthRecords')} />
            <ListTile icon="📊" title={t('manager')} desc={t('manager_desc')} tone="work"
              badge={<Tag label="@work" tone="work" />}
              onPress={() => navigation.navigate('ManagerDashboard')} />
          </>
        )}

        {/* 내 기록·설정 */}
        <Text style={styles.sectionLabel}>{SEC.records[lang]}</Text>
        {!isWork && (
          <ListTile icon="📋" title={t('docs')} desc={t('docs_desc')}
            badge={<Tag label="NEW" tone="new" />}
            onPress={() => navigation.navigate('HealthRecords')} />
        )}
        <ListTile icon="💊" title={t('meds')} desc={t('meds_desc')}
          onPress={() => navigation.navigate('MyMedicines')} />
        <ListTile icon="🕐" title={t('history')} desc={t('history_desc')}
          onPress={() => navigation.navigate('History')} />
        <ListTile icon="⚙️" title={t('settings')} desc={t('settings_desc')}
          onPress={() => navigation.navigate('Settings')} />

        <Disclaimer text={t('disclaimer')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 96 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, marginTop: spacing.xs },
  greet: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  crewBanner: { backgroundColor: colors.workLight, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  segment: { flexDirection: 'row', backgroundColor: colors.g200, borderRadius: radius.md, padding: 4, marginTop: spacing.md, marginBottom: spacing.md },
  segItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.sm },
  segItemOn: { backgroundColor: colors.card, shadowColor: '#191F28', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 3, elevation: 1 },
  segTxt: { fontSize: 14, fontWeight: '700' },
  sectionLabel: { ...typography.captionBold, color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: 4 },
  call119: { height: 64 },
});
