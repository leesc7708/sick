import React, { useEffect, useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import { AppBar } from '../components/AppBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors as _staticColors, radius, spacing, shadow } from '../theme/colors';
import { useTheme } from '../theme/theme';
import { typography } from '../theme/typography';
import { HealthCheckRecord, RootStackParamList } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'HealthRecordShare'>;

export function HealthRecordShareScreen({ navigation, route }: Props) {
  const { recordId } = route.params;
  const colors = useTheme();
  const [rec, setRec] = useState<HealthCheckRecord | null>(null);

  useEffect(() => {
    (async () => setRec(await storage.getHealthRecord(recordId)))();
  }, [recordId]);

  // ⚠️ 데모 링크 — 실제 만료 토큰·접근제어는 서버(백엔드 청사진) 연동 후 적용
  const link = `https://lifeline.app/s/${recordId}`;
  const shareLink = () => Share.share({ message: `[라이프라인] 건강검진기록 공유(데모)\n${rec?.type ?? ''}\n${link}\n※ 데모 링크입니다. 실제 만료·접근제어는 서버 연동 후 적용됩니다.` });
  const sendToManager = () => Share.share({ message: `[라이프라인] 현장관리자 제출(데모)\n근로자 ${rec?.type ?? '검진기록'}\n${link}\n※ 데모 — 실서비스에서는 사내 채널로 안전하게 전송됩니다.` });

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title="검진기록 공유" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={[typography.h2, { color: colors.text, textAlign: 'center' }]}>{rec?.type ?? '검진기록'} 공유</Text>
        <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: 6 }]}>
          현장 입구에서 이 QR을 보여주세요
        </Text>

        {/* QR은 두 테마 모두 스캔 가능하게 흰 배경·어두운 모듈 고정(테마색 미적용) */}
        <View style={[styles.qrBox, shadow.floating]}>
          <QRCode value={link} size={200} color={_staticColors.g900} backgroundColor="#fff" />
        </View>

        <View style={[styles.lock, shadow.card, { backgroundColor: colors.card }]}>
          <Text style={[typography.bodyBold, { color: colors.text, textAlign: 'center' }]}>🔒 데모 미리보기</Text>
          <Text style={[typography.small, { color: colors.textMuted, textAlign: 'center', marginTop: 4 }]}>만료(30분)·다운로드 차단·접근제어는 서버 연동 후 적용됩니다.</Text>
        </View>

        <PrimaryButton title="링크 공유" icon="🔗" variant="primary" onPress={shareLink} style={{ marginTop: spacing.lg }} />
        <PrimaryButton title="관리자에게 직접 전송" icon="📤" variant="outline" onPress={sendToManager} style={{ marginTop: spacing.sm }} />

        <Text style={[typography.small, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg }]}>
          건강검진기록은 민감 개인정보입니다. 실제 만료·접근 제한은 서버 연동 시 적용됩니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 색은 렌더 시 useTheme()로 덮음 — 여기 값은 정적 기본(라이트)일 뿐
  wrap: { flex: 1, backgroundColor: _staticColors.bg },
  content: { flex: 1, padding: spacing.lg, alignItems: 'stretch' },
  qrBox: { backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg, alignItems: 'center', alignSelf: 'center', marginTop: spacing.xl },
  lock: { backgroundColor: _staticColors.card, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg },
});
