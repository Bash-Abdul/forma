import { useFonts } from 'expo-font';
import { fontAssets } from '@/theme/fontAssets';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { DataGate } from '@/components/ui';
import { PersistenceProvider } from '@/lib/store';
import { ThemeProvider, useTheme } from '@/theme/provider';
import { LaunchOverlay } from '@/features/launch/components/LaunchOverlay';
void SplashScreen.preventAutoHideAsync().catch(() => undefined);
const client = new QueryClient();
export default function Layout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <PersistenceProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </PersistenceProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
function AppContent() {
  const { colors, dark } = useTheme();
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [launched, setLaunched] = useState(false);
  const finishLaunch = useCallback(() => setLaunched(true), []);
  if (!fontsLoaded && !fontError) return null;
  return (
    <>
      <View
        style={{ flex: 1, backgroundColor: colors.bg }}
        onLayout={() => void SplashScreen.hideAsync().catch(() => undefined)}
      >
        <StatusBar style={launched && !dark ? 'dark' : 'light'} />
        <DataGate>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          />
        </DataGate>
        {!launched ? <LaunchOverlay onFinish={finishLaunch} /> : null}
      </View>
    </>
  );
}
