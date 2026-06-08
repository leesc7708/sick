import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types';
import { BODY_PARTS } from '../data/bodyParts';
import { analyzeSymptom } from '../services/ai';

type Props = NativeStackScreenProps<RootStackParamList, 'SymptomInput'>;

const DURATION_OPTIONS = ['오늘 시작', '1-3일', '1주일 이상', '한 달 이상'];

export function SymptomInputScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<number>(0);
  const [duration, setDuration] = useState<string>('');
  const [loading, setLoading] = useState(false);

  function togglePart(id: string) {
    setSelectedParts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function submit() {
    if (!text.trim() && selectedParts.length === 0) {
      Alert.alert('입력 필요', '증상을 텍스트로 입력하거나 신체 부위를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const query = {
        text: text.trim() || selectedParts.map((id) => BODY_PARTS.find((b) => b.id === id)?.label).join(', '),
        bodyParts: selectedParts.map((id) => BODY_PARTS.find((b) => b.id === id)?.label ?? id),
        intensity: intensity || undefined,
        duration: duration || undefined,
      };
      const analysis = await analyzeSymptom(query);

      if (analysis.isRedFlag) {
        navigation.replace('RedFlag', { reason: analysis.redFlagReason ?? '응급 증상이 의심됩니다.' });
      } else {
        navigation.navigate('SymptomResult', { analysis, query });
      }
    } catch (e: any) {
      Alert.alert('분석 실패', e?.message ?? '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={[typography.h2, styles.title]}>어디가 아프세요?</Text>
      <Text style={[typography.body, styles.subtitle]}>
        자연어로 자세히 적을수록 더 정확한 정보를 받을 수 있어요.
      </Text>

      <Text style={[typography.bodyBold, styles.label]}>증상 설명</Text>
      <TextInput
        style={styles.textarea}
        placeholder="예: 어제 저녁부터 머리 오른쪽이 지끈지끈 아파요. 누우면 좀 나아져요."
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={4}
        placeholderTextColor={colors.textMuted}
      />

      <Text style={[typography.bodyBold, styles.label]}>신체 부위 (선택)</Text>
      <View style={styles.bodyGrid}>
        {BODY_PARTS.map((part) => {
          const active = selectedParts.includes(part.id);
          return (
            <Pressable
              key={part.id}
              style={[styles.bodyTile, active && styles.bodyTileActive]}
              onPress={() => togglePart(part.id)}
            >
              <Text style={styles.bodyEmoji}>{part.emoji}</Text>
              <Text style={[styles.bodyLabel, active && styles.bodyLabelActive]}>{part.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[typography.bodyBold, styles.label]}>통증 강도 (선택)</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <Pressable
            key={n}
            style={[styles.intensity, intensity === n && styles.intensityActive]}
            onPress={() => setIntensity(intensity === n ? 0 : n)}
          >
            <Text style={[styles.intensityText, intensity === n && styles.intensityTextActive]}>{n}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[typography.bodyBold, styles.label]}>지속 시간 (선택)</Text>
      <View style={styles.row}>
        {DURATION_OPTIONS.map((d) => (
          <Pressable
            key={d}
            style={[styles.chip, duration === d && styles.chipActive]}
            onPress={() => setDuration(duration === d ? '' : d)}
          >
            <Text style={[styles.chipText, duration === d && styles.chipTextActive]}>{d}</Text>
          </Pressable>
        ))}
      </View>

      <Disclaimer compact />

      <PrimaryButton
        title={loading ? '분석 중...' : '정보 분석하기'}
        onPress={submit}
        loading={loading}
        style={{ marginTop: spacing.lg }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, marginBottom: spacing.xs },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.md },
  label: { color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  textarea: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bodyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  bodyTile: {
    width: '30%',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  bodyTileActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  bodyEmoji: { fontSize: 28, marginBottom: spacing.xs },
  bodyLabel: { color: colors.text, fontSize: 13 },
  bodyLabelActive: { color: colors.primaryDark, fontWeight: '600' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  intensity: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  intensityText: { color: colors.text, fontWeight: '600' },
  intensityTextActive: { color: colors.textInverse },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text },
  chipTextActive: { color: colors.textInverse, fontWeight: '600' },
});
