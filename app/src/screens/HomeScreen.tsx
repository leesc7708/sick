import React, { useCallback, useRef, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ListTile } from '../components/ListTile';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { Tag } from '../components/Tag';
import { Chip } from '../components/Chip';
import { LogoMark } from '../components/LogoMark';
import { LangSwitcher } from '../components/LangSwitcher';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppMode, RootStackParamList } from '../types';
import { storage } from '../services/storage';
import { useRegisterScrollTop } from '../utils/scrollTop';
import { useLang } from '../i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [mode, setMode] = useState<AppMode>('work');
  const { t } = useLang();
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
      })();
    }, []),
  );

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
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
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

        <LangSwitcher style={{ marginBottom: spacing.sm }} />

        {/* 생명 직결: 119를 전체폭·최상단·최대로 (디자인팀 P0 — 위계 정상화) */}
        <PrimaryButton title="119 즉시 전화" icon="📞" variant="emergency" size="lg" style={styles.call119} onPress={() => Linking.openURL('tel:119')} />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton title={t('emergency_check')} icon="🚨" variant="primary" size="md" onPress={() => navigation.navigate('RedFlag')} />

        <View style={[styles.modeToggle, { marginTop: spacing.md }]}>
          <Chip label={t('mode_work')} tone="work" selected={isWork} onPress={() => changeMode('work')} />
          <Chip label={t('mode_general')} tone="primary" selected={!isWork} onPress={() => changeMode('general')} />
        </View>

        <ListTile icon="📝" title={t('symptom_organize')} desc={t('symptom_desc')}
          onPress={() => navigation.navigate('SymptomInput')} />
        <ListTile icon="🩺" title={t('dept_consult')} desc={t('dept_consult_desc')}
          badge={<Tag label="NEW" tone="new" />}
          onPress={() => navigation.navigate('DeptConsult')} />
        <ListTile icon="🏥" title={t('find_hospital')} desc={t('find_hospital_desc')}
          onPress={() => navigation.navigate('HospitalFinder')} />

        {isWork && (
          <>
            <ListTile icon="⚠️" title={t('incident_report')} desc={t('incident_desc')} tone="emergency"
              badge={<Tag label="@work" tone="work" />}
              onPress={() => navigation.navigate('IncidentReport')} />
            <ListTile icon="✅" title={t('workcheck')} desc={t('workcheck_desc')} tone="work"
              badge={<Tag label="@work" tone="work" />}
              onPress={() => navigation.navigate('WorkCheck')} />
          </>
        )}

        <ListTile icon="📋" title={t('docs')} desc={t('docs_desc')} tone="work"
          badge={<Tag label="NEW" tone="new" />}
          onPress={() => navigation.navigate('HealthRecords')} />

        <ListTile icon="💊" title={t('meds')} desc={t('meds_desc')}
          onPress={() => navigation.navigate('MyMedicines')} />

        {isWork && (
          <ListTile icon="📊" title={t('manager')} desc={t('manager_desc')} tone="work"
            badge={<Tag label="@work" tone="work" />}
            onPress={() => navigation.navigate('ManagerDashboard')} />
        )}

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
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, marginTop: spacing.xs },
  modeToggle: { flexDirection: 'row', marginBottom: spacing.md },
  call119: { height: 64 },
});
