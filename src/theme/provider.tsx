import * as SystemUI from 'expo-system-ui';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { Appearance, Platform, useColorScheme } from 'react-native';
import { useData } from '@/lib/store';
import { darkColors, lightColors, Palette, resolveAppearance } from './index';
const ThemeContext = createContext({ colors: lightColors, dark: false });
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data } = useData();
  const system = useColorScheme();
  const preference = data?.appearance ?? 'system';
  useEffect(() => {
    if (Platform.OS !== 'web')
      Appearance.setColorScheme(preference === 'system' ? 'auto' : preference);
  }, [preference]);
  const dark = resolveAppearance(data?.appearance, system) === 'dark';
  const value = useMemo(
    () => ({ colors: dark ? darkColors : lightColors, dark }),
    [dark],
  );
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(value.colors.bg).catch(
      () => undefined,
    );
  }, [value.colors.bg]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
export function useTheme() {
  return useContext(ThemeContext);
}
export function useThemedStyles<T>(factory: (colors: Palette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
