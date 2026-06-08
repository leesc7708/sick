import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const [aiMode, setAiMode] = useState<'mock' | 'real'>('mock');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    (async () => {
      setAiMode(await storage.getAiMode());
      setApiKey((await storage.getApiKey()) ?? '');
    })();
  }, []);

  async function save() {
    await storage.setAiMode(aiMode);
    if (apiKey.trim()) {
      await storage.setApiKey(apiKey.trim());
    }
    Alert.alert('저장됨', 'AI 설정이 저장되었습니다.');
  }

  async function resetAll() {
    Alert.alert('초기화 확인', '모든 데이터(프로필, 약, 설정)를 삭제합니다. 계속하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '초기화',
        style: 'destructive',
        onPress: async () => {
          await storage.clearAll();
          Alert.alert('완료', '초기화되었습니다. 앱을 다시 시작합니다.', [
            { text: '확인', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] }) },
          ]);
        },
      },
    ]);
  }

  return (
    <Screen>
      <Text style={[typography.h2, styles.title]}>설정</Text>

      <Card>
        <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.sm }]}>
          AI 분석 모드
        </Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.modeBtn, aiMode === 'mock' && styles.modeBtnActive]}
            onPress={() => setAiMode('mock')}
          >
            <Text style={[styles.modeText, aiMode === 'mock' && styles.modeTextActive]}>Mock (데모)</Text>
            <Text style={[styles.modeDesc, aiMode === 'mock' && { color: '#fff' }]}>
              API 키 없이 시뮬레이션
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeBtn, aiMode === 'real' && styles.modeBtnActive]}
            onPress={() => setAiMode('real')}
          >
            <Text style={[styles.modeText, aiMode === 'real' && styles.modeTextActive]}>실제 (Claude)</Text>
            <Text style={[styles.modeDesc, aiMode === 'real' && { color: '#fff' }]}>
              Claude API 호출
            </Text>
          </Pressable>
        </View>
      </Card>

      {aiMode === 'real' && (
        <Card>
          <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.sm }]}>
            Anthropic API 키
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            console.anthropic.com 에서 발급받은 키를 입력하세요.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="sk-ant-..."
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry={!showKey}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.textMuted}
          />
          <Pressable onPress={() => setShowKey(!showKey)}>
            <Text style={[typography.caption, { color: colors.secondary, marginTop: spacing.xs }]}>
              {showKey ? '🙈 키 숨기기' : '👁️ 키 보이기'}
            </Text>
          </Pressable>
          <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.sm }]}>
            ※ 키는 기기에만 저장되며 외부로 전송되지 않습니다.
            (실 배포 시에는 서버 프록시를 통한 호출을 권장합니다.)
          </Text>
        </Card>
      )}

      <PrimaryButton title="저장" onPress={save} style={{ marginTop: spacing.md }} />

      <Card style={{ marginTop: spacing.xl, borderColor: colors.danger, borderWidth: 1 }}>
        <Text style={[typography.bodyBold, { color: colors.danger, marginBottom: spacing.sm }]}>
          데이터 초기화
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.md }]}>
          프로필, 내 약 목록, 설정을 모두 삭제합니다.
        </Text>
        <PrimaryButton title="모든 데이터 삭제" variant="danger" onPress={resetAll} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm },
  modeBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  modeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  modeTextActive: { color: colors.textInverse },
  modeDesc: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  input: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
});
