import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { RootNavigation } from './src/navigation/RootNavigation';
import { ScrollTopFab } from './src/components/ScrollTopFab';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { AuthProvider } from './src/auth/AuthContext';
import { ThemeProvider, useThemeMode } from './src/theme/theme';

// 상태바 아이콘 색을 테마에 맞춤 (다크 배경 → 밝은 아이콘)
function ThemedStatusBar() {
  const { mode } = useThemeMode();
  return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
}

export default function App() {
  // Pretendard 로드 (실패/지연 시에도 앱은 시스템 폰트로 정상 동작 — 렌더를 막지 않음)
  useFonts({
    Pretendard: require('./assets/fonts/Pretendard-Regular.ttf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard-SemiBold.ttf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.ttf'),
  });

  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <SafeAreaProvider>
            <ThemedStatusBar />
            <RootNavigation />
            <ScrollTopFab />
          </SafeAreaProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
