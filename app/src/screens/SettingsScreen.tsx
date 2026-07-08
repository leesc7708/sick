import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ScreenScroll as ScrollView } from '../components/ScreenScroll';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppBar } from '../components/AppBar';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppMode, RootStackParamList } from '../types';
import { storage } from '../services/storage';
import { seedDemo } from '../services/demoSeed';
import { useAuth } from '../auth/AuthContext';
import { logout, Role } from '../services/auth';
import { useLang } from '../i18n/LanguageContext';
import { LANGS } from '../i18n/translations';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const ROLE_LABEL: Record<Role, string> = {
  general: '일반사용자(미승인)',
  worker: '근로자',
  svisor: '현장관리자 (Svisor)',
  ssvisor: '떠블에스바이저 (SSvisor)',
};

export function SettingsScreen({ navigation }: Props) {
  const [mode, setMode] = useState<AppMode>('work');
  const { account } = useAuth();
  const { lang, setLang, t } = useLang();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const p = await storage.getProfile();
        if (p) setMode(p.mode);
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

  const clearAll = () =>
    Alert.alert('전체 삭제', '저장된 모든 데이터를 삭제할까요? 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await storage.clearAll();
          navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
        },
      },
    ]);

  const fillDemo = () =>
    Alert.alert('데모 데이터', '시연용 샘플(검진·사고·작업체크·증상)을 추가할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '추가',
        onPress: async () => {
          await seedDemo();
          Alert.alert('완료', '샘플이 추가되었습니다.\n홈·관리자 대시보드·지난 기록·건강검진기록에서 확인하세요.');
        },
      },
    ]);

  return (
    <View style={styles.wrap}>
      <AppBar title="설정" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, shadow.card]}>
          <Text style={[typography.bodyBold, { color: colors.text }]}>🦺 모드</Text>
          <View style={styles.chips}>
            <Chip label="현장 모드" tone="work" selected={mode === 'work'} onPress={() => changeMode('work')} />
            <Chip label="일반 모드" tone="primary" selected={mode === 'general'} onPress={() => changeMode('general')} />
          </View>
        </View>

        <View style={[styles.card, shadow.card]}>
          <Text style={[typography.bodyBold, { color: colors.text }]}>🌐 {t('lang_label')}</Text>
          <View style={styles.chips}>
            {LANGS.map((l) => (
              <Chip key={l.code} label={l.label} tone="primary" selected={lang === l.code} onPress={() => setLang(l.code)} />
            ))}
          </View>
        </View>

        <View style={[styles.card, shadow.card]}>
          <Text style={[typography.bodyBold, { color: colors.text }]}>🔔 알림</Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>검진 만료·복약 알림 (데모)</Text>
        </View>

        <View style={[styles.card, shadow.card, { borderWidth: 1, borderColor: '#FFD9D6' }]}>
          <Text style={[typography.bodyBold, { color: colors.g500, textDecorationLine: 'line-through' }]}>✖ Claude API 키 입력 (제거됨)</Text>
          <Text style={[typography.small, { color: colors.textMuted, marginTop: 4 }]}>
            보안상 AI 호출은 서버 프록시(Cloud Functions)로만 처리합니다. API 키를 앱에 저장하지 않습니다.
          </Text>
        </View>

        {account && (
          <View style={[styles.card, shadow.card, { marginTop: spacing.lg }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary }]}>계정</Text>
            <Text style={[typography.body, { color: colors.text, marginTop: 4 }]}>{account.name} ({account.username})</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
              {ROLE_LABEL[account.role]} · {account.status === 'active' ? '승인됨' : account.status === 'pending' ? '승인 대기' : '거부됨'}
            </Text>
          </View>
        )}
        <PrimaryButton title="로그아웃" variant="outline" onPress={() => logout()} style={{ marginTop: spacing.md }} />

        <PrimaryButton title="🎬 데모 데이터 채우기" variant="secondary" onPress={fillDemo} style={{ marginTop: spacing.lg }} />
        <PrimaryButton title="모든 데이터 삭제" variant="outline" onPress={clearAll} style={{ marginTop: spacing.sm }} />

        <PrimaryButton title={t('privacy_title')} variant="outline" size="sm" onPress={() => navigation.navigate('PrivacyPolicy')} style={{ marginTop: spacing.lg }} />

        <Text style={[typography.small, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg }]}>
          라이프라인 Lifeline · 데모 빌드{'\n'}의료·약 정보 출처: E-Gen / 심평원 / 식약처
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
});
