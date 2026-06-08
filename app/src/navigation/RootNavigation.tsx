import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../types';
import { storage } from '../services/storage';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SymptomInputScreen } from '../screens/SymptomInputScreen';
import { RedFlagScreen } from '../screens/RedFlagScreen';
import { SymptomResultScreen } from '../screens/SymptomResultScreen';
import { HospitalFinderScreen } from '../screens/HospitalFinderScreen';
import { MedicineSearchScreen } from '../screens/MedicineSearchScreen';
import { MedicineDetailScreen } from '../screens/MedicineDetailScreen';
import { MyMedicinesScreen } from '../screens/MyMedicinesScreen';
import { InteractionCheckScreen } from '../screens/InteractionCheckScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textInverse,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SymptomInput" component={SymptomInputScreen} options={{ title: '증상 입력' }} />
        <Stack.Screen
          name="RedFlag"
          component={RedFlagScreen}
          options={{ title: '🚨 응급 안내', headerStyle: { backgroundColor: colors.emergency }, headerBackVisible: false }}
        />
        <Stack.Screen name="SymptomResult" component={SymptomResultScreen} options={{ title: '분석 결과' }} />
        <Stack.Screen name="HospitalFinder" component={HospitalFinderScreen} options={{ title: '병원 찾기' }} />
        <Stack.Screen name="MedicineSearch" component={MedicineSearchScreen} options={{ title: '약 검색' }} />
        <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} options={{ title: '약품 정보' }} />
        <Stack.Screen name="MyMedicines" component={MyMedicinesScreen} options={{ title: '내 약 목록' }} />
        <Stack.Screen name="InteractionCheck" component={InteractionCheckScreen} options={{ title: '상호작용 체크' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '설정' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
