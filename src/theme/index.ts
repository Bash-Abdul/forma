export type AppearancePreference = 'system' | 'light' | 'dark';
export const lightColors = {
  bg: '#F5F5F0',
  card: '#FFFFFF',
  text: '#192C29',
  muted: '#68736C',
  primary: '#26715C',
  pale: '#E8EEE7',
  line: '#DEE3DC',
  lime: '#DCEF99',
  danger: '#B94343',
  onPrimary: '#FFFFFF',
  hero: '#214F40',
  onHero: '#FFFFFF',
  heroMuted: '#C4D8CB',
};
export type Palette = typeof lightColors;
export const darkColors: Palette = {
  bg: '#111B17',
  card: '#1B2821',
  text: '#F1F3EB',
  muted: '#A7B5AA',
  primary: '#A9D3B6',
  pale: '#2A3C30',
  line: '#35473B',
  lime: '#DCEF99',
  danger: '#FFA59A',
  onPrimary: '#142B1E',
  hero: '#284F3E',
  onHero: '#FFFFFF',
  heroMuted: '#C4D8CB',
};
export function resolveAppearance(
  preference: AppearancePreference | undefined,
  system: string | null | undefined,
): 'light' | 'dark' {
  return preference === 'light' || preference === 'dark'
    ? preference
    : system === 'dark'
      ? 'dark'
      : 'light';
}
