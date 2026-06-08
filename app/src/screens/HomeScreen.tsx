import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Disclaimer } from '../components/Disclaimer';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList, UserProfile } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface Tile {
  emoji: string;
  title: string;
  desc: string;
  route: keyof RootStackParamList;
  bg: string;
}

const TILES: Tile[] = [
  { emoji: '🩺', title: '증상 확인', desc: '아픈 곳을 알려주세요', route: 'SymptomInput', bg: '#E8F5E9' },
  { emoji: '🏥', title: '병원 찾기', desc: '가까운 의료기관 보기', route: 'HospitalFinder', bg: '#E3F2FD' },
  { emoji: '💊', title: '약 검색', desc: '약품 정보 알아보기', route: 'MedicineSearch', bg: '#FFF3E0' },
  { emoji: '🧪', title: '약 상호작용', desc: '내 약 함께 먹어도 될까?', route: 'InteractionCheck', bg: '#F3E5F5' },
  { emoji: '📋', title: '내 약 목록', desc: '복용 중인 약 관리', route: 'MyMedicines', bg: '#FFEBEE' },
  { emoji: '⚙️', title: '설정', desc: 'AI 모드 / API 키 설정', route: 'Settings', bg: '#ECEFF1' },
];

export function HomeScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [aiMode, setAiMode] = useState<'mock' | 'real'>('mock');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setProfile(await storage.getProfile());
        setAiMode(await storage.getAiMode());
      })();
    }, []),
  );

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={[typography.h1, { color: colors.text }]}>어디아파</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            증상 확인부터 병원 연결까지
          </Text>
        </View>
        <View style={[styles.modeBadge, aiMode === 'real' ? styles.modeReal : styles.modeMock]}>
          <Text style={styles.modeBadgeText}>{aiMode === 'real' ? 'AI: 실제' : 'AI: Mock'}</Text>
        </View>
      </View>

      {profile && (
        <Card>
          <Text style={[typography.bodyBold, { color: colors.text }]}>
            {profile.age}세 · {profile.gender === 'male' ? '남' : profile.gender === 'female' ? '여' : '기타'}
            {profile.isPregnant ? ' · 임신 중' : ''}
            {profile.isLactating ? ' · 수유 중' : ''}
          </Text>
          {profile.conditions.length > 0 && (
            <Text style={[typography.caption, styles.profileDetail]}>
              기저질환: {profile.conditions.join(', ')}
            </Text>
          )}
          {profile.currentMedicines.length > 0 && (
            <Text style={[typography.caption, styles.profileDetail]}>
              복용약: {profile.currentMedicines.join(', ')}
            </Text>
          )}
        </Card>
      )}

      <View style={styles.grid}>
        {TILES.map((t) => (
          <Card
            key={t.route}
            style={{ ...styles.tile, backgroundColor: t.bg }}
            onPress={() => navigation.navigate(t.route as any)}
          >
            <Text style={styles.tileEmoji}>{t.emoji}</Text>
            <Text style={[typography.bodyBold, { color: colors.text }]}>{t.title}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t.desc}</Text>
          </Card>
        ))}
      </View>

      <Disclaimer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  modeMock: { backgroundColor: '#FFE0B2' },
  modeReal: { backgroundColor: '#C8E6C9' },
  modeBadgeText: { fontSize: 12, fontWeight: '600', color: colors.text },
  profileDetail: { color: colors.textSecondary, marginTop: spacing.xs },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  tile: {
    width: '48%',
    marginVertical: spacing.xs,
  },
  tileEmoji: { fontSize: 32, marginBottom: spacing.sm },
});
