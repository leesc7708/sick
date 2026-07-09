import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../types';
import { useAuth } from '../auth/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { CrewScreen } from '../screens/CrewScreen';
import { UserAdminScreen } from '../screens/UserAdminScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { RedFlagScreen } from '../screens/RedFlagScreen';
import { SymptomInputScreen } from '../screens/SymptomInputScreen';
import { SymptomSummaryScreen } from '../screens/SymptomSummaryScreen';
import { DeptConsultScreen } from '../screens/DeptConsultScreen';
import { PhrasebookScreen } from '../screens/PhrasebookScreen';
import { HospitalFinderScreen } from '../screens/HospitalFinderScreen';
import { AedFinderScreen } from '../screens/AedFinderScreen';
import { HealthRecordsScreen } from '../screens/HealthRecordsScreen';
import { HealthRecordShareScreen } from '../screens/HealthRecordShareScreen';
import { WorkCheckScreen } from '../screens/WorkCheckScreen';
import { IncidentReportScreen } from '../screens/IncidentReportScreen';
import { ManagerDashboardScreen } from '../screens/ManagerDashboardScreen';
import { MyMedicinesScreen } from '../screens/MyMedicinesScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

// 구 버전(일반 헬스케어) 화면은 보존하되 네비에서는 제외:
// import { SymptomResultScreen } from '../screens/SymptomResultScreen';
// import { MedicineSearchScreen } from '../screens/MedicineSearchScreen';
// import { MedicineDetailScreen } from '../screens/MedicineDetailScreen';
// import { InteractionCheckScreen } from '../screens/InteractionCheckScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// 웹에서 브라우저 주소/히스토리(마우스 뒤로가기) 연동
const linking = {
  prefixes: ['lifeline://', 'https://lifeline-safety.web.app'],
  config: {
    screens: {
      Login: 'login',
      Signup: 'signup',
      Onboarding: 'onboarding',
      Home: 'home',
      RedFlag: 'red-flag',
      SymptomInput: 'symptom',
      SymptomSummary: 'summary',
      DeptConsult: 'dept-consult',
      Phrasebook: 'speak',
      HospitalFinder: 'hospitals',
      AedFinder: 'aed',
      HealthRecords: 'health-records',
      HealthRecordShare: 'health-records/share/:recordId',
      WorkCheck: 'work-check',
      IncidentReport: 'incident',
      ManagerDashboard: 'manager',
      Crew: 'crew',
      MyMedicines: 'medicines',
      History: 'history',
      Settings: 'settings',
    },
  },
};

export function RootNavigation() {
  const { user, onboarded, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 로그인 상태에서 온보딩 미완료면 최초 1회 Onboarding으로 진입 (기존 유저도 소급)
  const initialRoute = user ? (onboarded ? 'Home' : 'Onboarding') : 'Login';

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : !onboarded ? (
          // 온보딩 미완료: Home을 아예 스택에서 제외 → 로그인 전환/새로고침 어느 경로로도 온보딩을 반드시 통과
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          </>
        ) : (
          <>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="RedFlag" component={RedFlagScreen} />
        <Stack.Screen name="SymptomInput" component={SymptomInputScreen} />
        <Stack.Screen name="SymptomSummary" component={SymptomSummaryScreen} />
        <Stack.Screen name="DeptConsult" component={DeptConsultScreen} />
        <Stack.Screen name="Phrasebook" component={PhrasebookScreen} />
        <Stack.Screen name="HospitalFinder" component={HospitalFinderScreen} />
        <Stack.Screen name="AedFinder" component={AedFinderScreen} />
        <Stack.Screen name="HealthRecords" component={HealthRecordsScreen} />
        <Stack.Screen name="HealthRecordShare" component={HealthRecordShareScreen} />
        <Stack.Screen name="WorkCheck" component={WorkCheckScreen} />
        <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
        <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
        <Stack.Screen name="Crew" component={CrewScreen} />
        <Stack.Screen name="UserAdmin" component={UserAdminScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="MyMedicines" component={MyMedicinesScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
