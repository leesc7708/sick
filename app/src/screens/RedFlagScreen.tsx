import React from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RedFlag'>;

export function RedFlagScreen({ navigation, route }: Props) {
  const { reason } = route.params;

  function call119() {
    Linking.openURL('tel:119').catch(() => {
      Alert.alert('전화 연결 실패', '직접 119에 전화해 주세요.');
    });
  }

  function goEmergencyRoom() {
    navigation.replace('HospitalFinder', { departments: ['응급의학과'] });
  }

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Text style={styles.iconLarge}>🚨</Text>
        </View>
        <Text style={[typography.h1, styles.title]}>응급 상황 안내</Text>
        <Text style={[typography.body, styles.lead]}>
          입력하신 증상은 응급 상황일 수 있습니다.
        </Text>

        <View style={styles.reasonBox}>
          <Text style={[typography.bodyBold, styles.reasonTitle]}>왜 응급 상황인가요?</Text>
          <Text style={[typography.body, styles.reasonText]}>{reason}</Text>
        </View>

        <Text style={[typography.body, styles.instruction]}>
          즉시 <Text style={styles.bold}>119에 전화</Text>하거나{'\n'}
          가까운 <Text style={styles.bold}>응급실</Text>을 방문하세요.
        </Text>

        <View style={styles.actions}>
          <PrimaryButton title="📞 119 전화 연결" variant="danger" onPress={call119} />
          <PrimaryButton
            title="🏥 응급실 찾기"
            variant="secondary"
            onPress={goEmergencyRoom}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <PrimaryButton
          title="응급 상황이 아닙니다 (계속 진행)"
          variant="outline"
          onPress={() =>
            Alert.alert(
              '확인',
              '응급 상황이 아니라고 확인하셨습니다. 그래도 증상이 지속되면 의료기관을 방문하세요.',
              [
                { text: '취소', style: 'cancel' },
                { text: '확인', onPress: () => navigation.goBack() },
              ],
            )
          }
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'stretch' },
  iconWrap: { alignItems: 'center', marginBottom: spacing.md },
  iconLarge: { fontSize: 64 },
  title: { textAlign: 'center', color: colors.emergency, marginBottom: spacing.sm },
  lead: { textAlign: 'center', color: colors.text, marginBottom: spacing.lg },
  reasonBox: {
    backgroundColor: '#FFEBEE',
    borderColor: colors.emergency,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  reasonTitle: { color: colors.emergency, marginBottom: spacing.xs },
  reasonText: { color: colors.text },
  instruction: { textAlign: 'center', color: colors.text, marginBottom: spacing.lg },
  bold: { fontWeight: '700', color: colors.emergency },
  actions: { marginTop: spacing.md },
});
