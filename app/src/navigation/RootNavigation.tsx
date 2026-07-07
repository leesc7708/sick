import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../types';
import { storage } from '../services/storage';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { RedFlagScreen } from '../screens/RedFlagScreen';
import { SymptomInputScreen } from '../screens/SymptomInputScreen';
import { SymptomSummaryScreen } from '../screens/SymptomSummaryScreen';
import { DeptConsultScreen } from '../screens/DeptConsultScreen';
import { PhrasebookScreen } from '../screens/PhrasebookScreen';
import { HospitalFinderScreen } from '../screens/HospitalFinderScreen';
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
      Onboarding: 'onboarding',
      Home: 'home',
      RedFlag: 'red-flag',
      SymptomInput: 'symptom',
      SymptomSummary: 'summary',
      DeptConsult: 'dept-consult',
      Phrasebook: 'speak',
      HospitalFinder: 'hospitals',
      HealthRecords: 'health-records',
      HealthRecordShare: 'health-records/share/:recordId',
      WorkCheck: 'work-check',
      IncidentReport: 'incident',
      ManagerDashboard: 'manager',
      MyMedicines: 'medicines',
      History: 'history',
      Settings: 'settings',
    },
  },
};

export function RootNavigation() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Onboarding');

  useEffect(() => {
    (async () => {
      const profile = await storage.getProfile();
      setInitialRoute(profile?.onboardingDone ? 'Home' : 'Onboarding');
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="RedFlag" component={RedFlagScreen} />
        <Stack.Screen name="SymptomInput" component={SymptomInputScreen} />
        <Stack.Screen name="SymptomSummary" component={SymptomSummaryScreen} />
        <Stack.Screen name="DeptConsult" component={DeptConsultScreen} />
        <Stack.Screen name="Phrasebook" component={PhrasebookScreen} />
        <Stack.Screen name="HospitalFinder" component={HospitalFinderScreen} />
        <Stack.Screen name="HealthRecords" component={HealthRecordsScreen} />
        <Stack.Screen name="HealthRecordShare" component={HealthRecordShareScreen} />
        <Stack.Screen name="WorkCheck" component={WorkCheckScreen} />
        <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
        <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
        <Stack.Screen name="MyMedicines" component={MyMedicinesScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
