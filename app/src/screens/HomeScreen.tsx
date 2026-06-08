import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ListTile } from '../components/ListTile';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { Tag } from '../components/Tag';
import { LogoMark } from '../components/LogoMark';
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
  const toTop = useCallback(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), []);
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

        <PrimaryButton
          title={t('emergency_check')}
          icon="🚨"
          variant="emergency"
          size="lg"
          onPress={() => navigation.navigate('RedFlag')}
          style={{ marginBottom: spacing.md }}
        />

        <ListTile icon="📝" title={t('symptom_organize')} desc={t('symptom_desc')}
          onPress={() => navigation.navigate('SymptomInput')} />
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
});
