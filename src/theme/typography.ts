import { isLoaded } from 'expo-font';
import { Platform } from 'react-native';
const fallback =
  Platform.OS === 'web'
    ? 'system-ui, sans-serif'
    : Platform.OS === 'android'
      ? 'sans-serif'
      : 'System';
function face(name: string): string {
  if (!isLoaded(name)) return fallback;
  return Platform.OS === 'web' ? `${name}, ${fallback}` : name;
}
/** Explicit bundled faces avoid synthetic bold; failed loads use the native font. */
export const fonts = {
  get regular(): string {
    return face('DMSans_400Regular');
  },
  get medium(): string {
    return face('DMSans_500Medium');
  },
  get semibold(): string {
    return face('DMSans_600SemiBold');
  },
  get display(): string {
    return face('BarlowCondensed_600SemiBold');
  },
};
