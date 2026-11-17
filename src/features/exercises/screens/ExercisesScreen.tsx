import { useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import {
  Button,
  Card,
  Field,
  Heading,
  ListRow,
  Screen,
  s,
} from '@/components/ui';
import { exercises } from '@/mocks/exercises';
import { Exercise } from '@/types';
import { colors as c } from '@/theme';
import { ExerciseFilters, emptyFilters } from '../components/ExerciseFilters';
export default function ExercisesScreen() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(emptyFilters);
  const { muscle, equipment } = filters;
  const [selected, setSelected] = useState<Exercise | null>(null);
  const filtered = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) &&
      (muscle === 'All muscles' || e.muscle === muscle) &&
      (equipment === 'All equipment' || e.equipment === equipment),
  );
  return (
    <Screen>
      <Heading
        eyebrow="MOVE WITH CONFIDENCE"
        title="Exercise library"
        detail="Find your next movement. Learn the fundamentals."
      />
      <Field
        label="Search exercises"
        placeholder="Search by exercise name…"
        value={search}
        onChangeText={setSearch}
      />
      <ExerciseFilters value={filters} onChange={setFilters} />
      <Text style={s.small}>
        {filtered.length} {filtered.length === 1 ? 'exercise' : 'exercises'}
      </Text>
      <Card style={{ paddingVertical: 3 }}>
        {filtered.map((e, i) => (
          <View key={e.id}>
            {i ? <View style={s.divider} /> : null}
            <ListRow
              title={e.name}
              detail={`${e.muscle} · ${e.equipment}`}
              icon={<Dumbbell size={20} color={c.primary} />}
              onPress={() => setSelected(e)}
            />
          </View>
        ))}
        {!filtered.length ? (
          <Text style={[s.body, { padding: 15 }]}>
            No matching exercises. Try another filter.
          </Text>
        ) : null}
      </Card>
      <Modal
        visible={!!selected}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#0007',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: c.bg,
              padding: 28,
              paddingBottom: 48,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              gap: 20,
            }}
          >
            <Heading
              title={selected?.name ?? ''}
              detail={`${selected?.muscle} · ${selected?.equipment} · ${selected?.category}`}
            />
            {selected?.secondary.length ? (
              <Text style={s.body}>
                Also works: {selected.secondary.join(', ')}
              </Text>
            ) : null}
            <Text style={s.sectionTitle}>How to perform</Text>
            <Text style={s.body}>{selected?.instructions}</Text>
            <Button label="Got it" onPress={() => setSelected(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
