import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigation } from './src/navigation/RootNavigation';
import { ScrollTopFab } from './src/components/ScrollTopFab';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigation />
      <ScrollTopFab />
    </SafeAreaProvider>
  );
}
