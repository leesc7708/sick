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
import { useLang } from '../i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'HealthRecordShare'>;

export function HealthRecordShareScreen({ navigation, route }: Props) {
  const { recordId } = route.params;
  const colors = useTheme();
  const { t } = useLang();
  const [rec, setRec] = useState<HealthCheckRecord | null>(null);

  useEffect(() => {
    (async () => setRec(await storage.getHealthRecord(recordId)))();
  }, [recordId]);

  // ⚠️ 데모 링크 — 실제 만료 토큰·접근제어는 서버(백엔드 청사진) 연동 후 적용
  const link = `https://lifeline.app/s/${recordId}`;
  const type = rec?.type ?? '';
  const shareLink = () => Share.share({ message: `${t('hrs_msg_share_head')}\n${type}\n${link}\n${t('hrs_msg_share_note')}` });
  const sendToManager = () => Share.share({ message: `${t('hrs_msg_mgr_head')}\n${type}\n${link}\n${t('hrs_msg_mgr_note')}` });

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <AppBar title={t('hrs_title')} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={[typography.h2, { color: colors.text, textAlign: 'center' }]}>{t('hrs_title')}</Text>
        {!!type && <Text style={[typography.bodyBold, { color: colors.primary, textAlign: 'center', marginTop: 4 }]}>{type}</Text>}
        <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: 6 }]}>
          {t('hrs_show_qr')}
        </Text>

        {/* QR은 두 테마 모두 스캔 가능하게 흰 배경·어두운 모듈 고정(테마색 미적용) */}
        <View style={[styles.qrBox, shadow.floating]}>
          <QRCode value={link} size={200} color={_staticColors.g900} backgroundColor="#fff" />
        </View>

        <View style={[styles.lock, shadow.card, { backgroundColor: colors.card }]}>
          <Text style={[typography.bodyBold, { color: colors.text, textAlign: 'center' }]}>{t('hrs_demo_title')}</Text>
          <Text style={[typography.small, { color: colors.textMuted, textAlign: 'center', marginTop: 4 }]}>{t('hrs_demo_desc')}</Text>
        </View>

        <PrimaryButton title={t('hrs_share_link')} icon="🔗" variant="primary" onPress={shareLink} style={{ marginTop: spacing.lg }} />
        <PrimaryButton title={t('hrs_send_manager')} icon="📤" variant="outline" onPress={sendToManager} style={{ marginTop: spacing.sm }} />

        <Text style={[typography.small, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg }]}>
          {t('hrs_sensitive')}
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
