import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigation } from './src/navigation/RootNavigation';
import { ScrollTopFab } from './src/components/ScrollTopFab';
import { LanguageProvider } from './src/i18n/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <RootNavigation />
        <ScrollTopFab />
      </SafeAreaProvider>
    </LanguageProvider>
  );
}
