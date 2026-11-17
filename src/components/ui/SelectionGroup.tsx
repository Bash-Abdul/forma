import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors as c } from '@/theme';
import { s } from './index';
export type Choice<T extends string | number> = {
  value: T;
  label: string;
  detail?: string;
};
export function SelectionGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  multiple = false,
  disabled = false,
}: {
  label: string;
  options: Choice<T>[];
  value: T | T[];
  onChange: (value: T) => void;
  multiple?: boolean;
  disabled?: boolean;
}) {
  const selected = (v: T) =>
    Array.isArray(value) ? value.includes(v) : value === v;
  return (
    <View style={{ gap: 10 }}>
      <Text accessibilityRole="header" style={s.label}>
        {label}
      </Text>
      <View style={styles.group}>
        {options.map((option, i) => (
          <Pressable
            key={option.value}
            accessibilityRole={multiple ? 'checkbox' : 'radio'}
            accessibilityLabel={`${label}: ${option.label}`}
            accessibilityState={{ checked: selected(option.value), disabled }}
            aria-checked={selected(option.value)}
            accessibilityHint={option.detail}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              i > 0 && styles.border,
              selected(option.value) && { backgroundColor: c.pale },
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.rowTitle}>{option.label}</Text>
              {option.detail ? (
                <Text style={s.small}>{option.detail}</Text>
              ) : null}
            </View>
            <View
              style={[
                styles.indicator,
                selected(option.value) && {
                  backgroundColor: c.primary,
                  borderColor: c.primary,
                },
              ]}
            >
              {selected(option.value) ? (
                <Check size={14} color="white" />
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  group: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: c.line,
  },
  option: {
    minHeight: 52,
    padding: 15,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  border: { borderTopWidth: 1, borderTopColor: c.line },
  indicator: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#AFBAB4',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
