import React, { useEffect, useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import { AppBar } from '../components/AppBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing, shadow } from '../theme/colors';
import { typography } from '../theme/typography';
import { HealthCheckRecord, RootStackParamList } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'HealthRecordShare'>;

export function HealthRecordShareScreen({ navigation, route }: Props) {
  const { recordId } = route.params;
  const [rec, setRec] = useState<HealthCheckRecord | null>(null);

  useEffect(() => {
    (async () => setRec(await storage.getHealthRecord(recordId)))();
  }, [recordId]);

  // 데모용 만료 공유 링크 (실제로는 서버에서 만료 토큰 발급)
  const link = `https://safecall.app/s/${recordId}`;
  const shareLink = () => Share.share({ message: `[세이프콜] 건강검진기록 공유\n${rec?.type ?? ''}\n${link}\n※ 30분 후 만료되는 보기 전용 링크입니다.` });

  return (
    <View style={styles.wrap}>
      <AppBar title="검진기록 공유" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={[typography.h2, { color: colors.text, textAlign: 'center' }]}>{rec?.type ?? '검진기록'} 공유</Text>
        <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: 6 }]}>
          현장 입구에서 이 QR을 보여주세요
        </Text>

        <View style={[styles.qrBox, shadow.floating]}>
          <QRCode value={link} size={200} color={colors.g900} backgroundColor="#fff" />
        </View>

        <View style={[styles.lock, shadow.card]}>
          <Text style={[typography.bodyBold, { color: colors.text, textAlign: 'center' }]}>🔒 30분 후 자동 만료</Text>
          <Text style={[typography.small, { color: colors.textMuted, textAlign: 'center', marginTop: 4 }]}>보기 전용 · 다운로드 차단 · 공유 동의 기록</Text>
        </View>

        <PrimaryButton title="만료 링크 공유" icon="🔗" variant="primary" onPress={shareLink} style={{ marginTop: spacing.lg }} />
        <PrimaryButton title="관리자에게 직접 전송" icon="📤" variant="outline" onPress={shareLink} style={{ marginTop: spacing.sm }} />

        <Text style={[typography.small, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg }]}>
          건강검진기록은 민감 개인정보입니다. 공유 시 만료·접근 제한이 적용됩니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, alignItems: 'stretch' },
  qrBox: { backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg, alignItems: 'center', alignSelf: 'center', marginTop: spacing.xl },
  lock: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg },
});
