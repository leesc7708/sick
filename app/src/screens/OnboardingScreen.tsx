import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PrimaryButton } from '../components/PrimaryButton';
import { Disclaimer } from '../components/Disclaimer';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList, UserProfile, Gender } from '../types';
import { storage } from '../services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const CONDITION_OPTIONS = ['고혈압', '당뇨', '고지혈증', '심장질환', '간질환', '신장질환', '천식', '갑상선'];
const ALLERGY_OPTIONS = ['페니실린', '아스피린', '설파제', '조영제', '계란', '우유', '땅콩', '해산물'];

export function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [isPregnant, setIsPregnant] = useState(false);
  const [isLactating, setIsLactating] = useState(false);
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [medicines, setMedicines] = useState('');

  const totalSteps = 5;

  function toggle<T>(list: T[], setter: (l: T[]) => void, item: T) {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  async function finish() {
    const profile: UserProfile = {
      age: parseInt(age, 10) || 0,
      gender: gender ?? 'other',
      isPregnant,
      isLactating,
      conditions,
      allergies,
      currentMedicines: medicines.split(',').map((s) => s.trim()).filter(Boolean),
      onboardingDone: true,
    };
    await storage.setProfile(profile);
    navigation.replace('Home');
  }

  return (
    <Screen>
      <View style={styles.progressBar}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, i <= step ? { backgroundColor: colors.primary } : null]}
          />
        ))}
      </View>
      <Text style={[typography.caption, styles.stepLabel]}>{step + 1} / {totalSteps}</Text>

      {step === 0 && (
        <View>
          <Text style={[typography.h1, styles.title]}>안녕하세요! 👋</Text>
          <Text style={[typography.body, styles.subtitle]}>
            "어디아파"는 증상 정보와 병원 안내를 도와드립니다.
            의료 전문가의 진단을 대체하지 않으며, 모든 정보는 참고용입니다.
          </Text>
          <Disclaimer />
          <PrimaryButton title="시작하기" onPress={() => setStep(1)} style={{ marginTop: spacing.lg }} />
        </View>
      )}

      {step === 1 && (
        <View>
          <Text style={[typography.h2, styles.title]}>기본 정보</Text>
          <Text style={[typography.body, styles.subtitle]}>맞춤 안내를 위해 입력해주세요.</Text>

          <Text style={[typography.bodyBold, styles.label]}>연령</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 32"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[typography.bodyBold, styles.label]}>성별</Text>
          <View style={styles.row}>
            {(['male', 'female', 'other'] as Gender[]).map((g) => (
              <Pressable
                key={g}
                style={[styles.chip, gender === g && styles.chipActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>
                  {g === 'male' ? '남' : g === 'female' ? '여' : '기타'}
                </Text>
              </Pressable>
            ))}
          </View>

          {gender === 'female' && (
            <>
              <Text style={[typography.bodyBold, styles.label]}>임신/수유</Text>
              <View style={styles.row}>
                <Pressable
                  style={[styles.chip, isPregnant && styles.chipActive]}
                  onPress={() => setIsPregnant(!isPregnant)}
                >
                  <Text style={[styles.chipText, isPregnant && styles.chipTextActive]}>임신 중</Text>
                </Pressable>
                <Pressable
                  style={[styles.chip, isLactating && styles.chipActive]}
                  onPress={() => setIsLactating(!isLactating)}
                >
                  <Text style={[styles.chipText, isLactating && styles.chipTextActive]}>수유 중</Text>
                </Pressable>
              </View>
            </>
          )}

          <View style={styles.btnRow}>
            <PrimaryButton title="이전" variant="outline" onPress={() => setStep(0)} style={{ flex: 1 }} />
            <PrimaryButton
              title="다음"
              onPress={() => setStep(2)}
              disabled={!age || !gender}
              style={{ flex: 1, marginLeft: spacing.sm }}
            />
          </View>
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={[typography.h2, styles.title]}>기저질환</Text>
          <Text style={[typography.body, styles.subtitle]}>해당하는 항목을 모두 선택하세요. (선택)</Text>
          <View style={styles.wrap}>
            {CONDITION_OPTIONS.map((c) => (
              <Pressable
                key={c}
                style={[styles.chip, conditions.includes(c) && styles.chipActive]}
                onPress={() => toggle(conditions, setConditions, c)}
              >
                <Text style={[styles.chipText, conditions.includes(c) && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.btnRow}>
            <PrimaryButton title="이전" variant="outline" onPress={() => setStep(1)} style={{ flex: 1 }} />
            <PrimaryButton title="다음" onPress={() => setStep(3)} style={{ flex: 1, marginLeft: spacing.sm }} />
          </View>
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={[typography.h2, styles.title]}>알레르기</Text>
          <Text style={[typography.body, styles.subtitle]}>해당하는 알레르기를 선택하세요. (선택)</Text>
          <View style={styles.wrap}>
            {ALLERGY_OPTIONS.map((a) => (
              <Pressable
                key={a}
                style={[styles.chip, allergies.includes(a) && styles.chipActive]}
                onPress={() => toggle(allergies, setAllergies, a)}
              >
                <Text style={[styles.chipText, allergies.includes(a) && styles.chipTextActive]}>{a}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.btnRow}>
            <PrimaryButton title="이전" variant="outline" onPress={() => setStep(2)} style={{ flex: 1 }} />
            <PrimaryButton title="다음" onPress={() => setStep(4)} style={{ flex: 1, marginLeft: spacing.sm }} />
          </View>
        </View>
      )}

      {step === 4 && (
        <View>
          <Text style={[typography.h2, styles.title]}>복용 중인 약</Text>
          <Text style={[typography.body, styles.subtitle]}>쉼표로 구분해 입력하세요. (선택)</Text>
          <TextInput
            style={[styles.input, { minHeight: 80 }]}
            placeholder="예: 암로디핀, 메트포르민"
            value={medicines}
            onChangeText={setMedicines}
            multiline
            placeholderTextColor={colors.textMuted}
          />
          <Disclaimer compact />
          <View style={styles.btnRow}>
            <PrimaryButton title="이전" variant="outline" onPress={() => setStep(3)} style={{ flex: 1 }} />
            <PrimaryButton title="완료" onPress={finish} style={{ flex: 1, marginLeft: spacing.sm }} />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  progressDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  stepLabel: { textAlign: 'center', color: colors.textMuted, marginBottom: spacing.lg },
  title: { color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.md },
  label: { color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 14 },
  chipTextActive: { color: colors.textInverse, fontWeight: '600' },
  btnRow: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.sm },
});
