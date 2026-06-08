import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigation } from './src/navigation/RootNavigation';
import { FloatingSOS } from './src/components/FloatingSOS';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigation />
      <FloatingSOS />
    </SafeAreaProvider>
  );
}
