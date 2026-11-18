import { Palette } from '@/theme';
import { useTheme, useThemedStyles } from '@/theme/provider';
import { useState } from 'react';
import { Modal, Pressable, Text, View, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Button, Heading, Screen, useUiStyles } from '@/components/ui';
import { SelectionGroup } from '@/components/ui/SelectionGroup';
import { exercises } from '@/mocks/exercises';

type Filters = { muscle: string; equipment: string };
export const emptyFilters: Filters = {
  muscle: 'All muscles',
  equipment: 'All equipment',
};
export function ExerciseFilters({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (filters: Filters) => void;
}) {
  const s = useUiStyles();
  const { colors: c } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [open, setOpen] = useState<keyof Filters | null>(null);
  const [draft, setDraft] = useState(value);
  function show(key: keyof Filters): void {
    setDraft(value);
    setOpen(key);
  }
  const active =
    value.muscle !== emptyFilters.muscle ||
    value.equipment !== emptyFilters.equipment;
  return (
    <>
      <View style={styles.bar}>
        {(['muscle', 'equipment'] as const).map((key) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${key}: ${value[key]}`}
            accessibilityState={{ expanded: open === key }}
            onPress={() => show(key)}
            style={styles.control}
          >
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={s.small}>
                {key === 'muscle' ? 'Muscle group' : 'Equipment'}
              </Text>
              <Text numberOfLines={1} style={s.rowTitle}>
                {value[key]}
              </Text>
            </View>
            <ChevronDown size={16} color={c.primary} />
          </Pressable>
        ))}
      </View>
      {active ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange(emptyFilters)}
          style={{
            alignSelf: 'flex-start',
            minHeight: 44,
            justifyContent: 'center',
          }}
        >
          <Text style={s.link}>Clear filters</Text>
        </Pressable>
      ) : null}
      <Modal
        visible={!!open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(null)}
      >
        <Screen>
          <Heading
            title={
              open === 'muscle' ? 'Filter by muscle' : 'Filter by equipment'
            }
            detail="Choose a filter, then apply it to the library."
          />
          <SelectionGroup
            label={open === 'muscle' ? 'Muscle group' : 'Equipment'}
            value={open ? draft[open] : ''}
            options={(open === 'muscle'
              ? ['All muscles', ...new Set(exercises.map((e) => e.muscle))]
              : ['All equipment', ...new Set(exercises.map((e) => e.equipment))]
            ).map((v) => ({ value: v, label: v }))}
            onChange={(v) => {
              if (open) setDraft((current) => ({ ...current, [open]: v }));
            }}
          />
          <Button
            label="Apply filter"
            onPress={() => {
              onChange(draft);
              setOpen(null);
            }}
          />
          <Button secondary label="Cancel" onPress={() => setOpen(null)} />
        </Screen>
      </Modal>
    </>
  );
}
const createStyles = (c: Palette) =>
  StyleSheet.create({
    bar: { flexDirection: 'row', gap: 12 },
    control: {
      flex: 1,
      flexDirection: 'row',
      gap: 6,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.line,
      alignItems: 'center',
      minHeight: 64,
    },
  });
