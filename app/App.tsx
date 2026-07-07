import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { RootNavigation } from './src/navigation/RootNavigation';
import { ScrollTopFab } from './src/components/ScrollTopFab';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { AuthProvider } from './src/auth/AuthContext';

export default function App() {
  // Pretendard 로드 (실패/지연 시에도 앱은 시스템 폰트로 정상 동작 — 렌더를 막지 않음)
  useFonts({
    Pretendard: require('./assets/fonts/Pretendard-Regular.ttf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.ttf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.ttf'),
  });

  return (
    <AuthProvider>
      <LanguageProvider>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <RootNavigation />
          <ScrollTopFab />
        </SafeAreaProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
