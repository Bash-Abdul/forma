import { fonts } from '@/theme/typography';
import { Pressable, Text, View } from 'react-native';
import { AppearancePreference } from '@/theme';
import { useTheme } from '@/theme/provider';
import { useUiStyles } from '@/components/ui';
import { useData, useSave } from '@/lib/store';
const options: { value: AppearancePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];
export function AppearanceSettings() {
  const { data } = useData();
  const save = useSave();
  const { colors: c } = useTheme();
  const s = useUiStyles();
  const current = data?.appearance ?? 'system';
  return (
    <View style={{ gap: 12 }}>
      <Text style={s.sectionTitle}>Appearance</Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="App appearance"
        style={{
          flexDirection: 'row',
          backgroundColor: c.pale,
          padding: 4,
          borderRadius: 6,
          gap: 4,
        }}
      >
        {options.map(({ value, label }) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            aria-checked={current === value}
            accessibilityState={{
              checked: current === value,
              disabled: save.isPending,
            }}
            disabled={save.isPending}
            onPress={() =>
              void save
                .mutateAsync((d) => ({ ...d, appearance: value }))
                .catch(() => undefined)
            }
            style={{
              flex: 1,
              minHeight: 46,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 4,
              backgroundColor: current === value ? c.card : 'transparent',
            }}
          >
            <Text
              style={{
                color: current === value ? c.text : c.muted,
                fontSize: 14,
                fontFamily: current === value ? fonts.semibold : fonts.regular,
              }}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.small}>System follows your device’s appearance.</Text>
      {save.isError ? (
        <Text accessibilityRole="alert" style={s.error}>
          Couldn’t save appearance. Try again.
        </Text>
      ) : null}
    </View>
  );
}
