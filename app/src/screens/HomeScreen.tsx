import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ListTile } from '../components/ListTile';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { Tag } from '../components/Tag';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { AppMode, RootStackParamList } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [mode, setMode] = useState<AppMode>('work');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const p = await storage.getProfile();
        if (p) setMode(p.mode);
      })();
    }, []),
  );

  const isWork = mode === 'work';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={[typography.h1, { color: colors.text }]}>
              세이프콜 {isWork && <Text style={{ color: colors.work }}>@work</Text>}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {isWork ? '아플 때·다쳤을 때, 현장에서 가장 먼저' : '증상 정리부터 병원 연결까지'}
            </Text>
          </View>
        </View>

        <PrimaryButton
          title="응급 신호 먼저 확인"
          icon="🚨"
          variant="emergency"
          size="lg"
          onPress={() => navigation.navigate('RedFlag')}
          style={{ marginBottom: spacing.md }}
        />

        <ListTile icon="📝" title="지금 증상 정리하기" desc="병원에서 보여줄 요약 카드"
          onPress={() => navigation.navigate('SymptomInput')} />
        <ListTile icon="🏥" title="병원·약국·응급실 찾기" desc="실시간 가용병상 확인"
          onPress={() => navigation.navigate('HospitalFinder')} />

        {isWork && (
          <>
            <ListTile icon="⚠️" title="사고·이상 보고" desc="1초 보고 + 응급처치 안내" tone="emergency"
              badge={<Tag label="@work" tone="work" />}
              onPress={() => navigation.navigate('IncidentReport')} />
            <ListTile icon="✅" title="작업 전 건강체크" desc="오늘 컨디션 점검 → 관리자 전송" tone="work"
              badge={<Tag label="@work" tone="work" />}
              onPress={() => navigation.navigate('WorkCheck')} />
            <ListTile icon="📋" title="건강검진기록" desc="한 번 올려두면 QR로 즉시 제출" tone="work"
              badge={<Tag label="NEW" tone="new" />}
              onPress={() => navigation.navigate('HealthRecords')} />
          </>
        )}

        <ListTile icon="💊" title="내 복용약" desc="병원·약국에 보여줄 목록"
          onPress={() => navigation.navigate('MyMedicines')} />

        {isWork && (
          <ListTile icon="📊" title="관리자 대시보드" desc="현장 체크·사고·검진 현황" tone="work"
            badge={<Tag label="@work" tone="work" />}
            onPress={() => navigation.navigate('ManagerDashboard')} />
        )}

        <ListTile icon="🕐" title="지난 기록" desc="증상·사고·체크 이력"
          onPress={() => navigation.navigate('History')} />
        <ListTile icon="⚙️" title="설정" desc="모드 전환 · 데이터 관리"
          onPress={() => navigation.navigate('Settings')} />

        <Disclaimer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.md, marginTop: spacing.xs },
});
