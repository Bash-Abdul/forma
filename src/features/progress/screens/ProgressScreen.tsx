import { Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Button,
  Card,
  Heading,
  Screen,
  Section,
  useUiStyles,
} from '@/components/ui';
import { useData } from '@/lib/store';
import { personalWeights, personalWorkouts } from '@/lib/records';
import { volume, weekStart } from '@/lib/training';
import { formatWeight } from '@/features/profile/services/measurements';
import { WeightTrend } from '../components/WeightTrend';
export default function ProgressScreen() {
  const s = useUiStyles();

  const { data } = useData();
  if (!data) return null;
  const units = data.fitnessProfile.units;
  const workouts = personalWorkouts(data);
  const weights = personalWeights(data);
  const entries = weights.slice(-12);
  const first = weights[0]?.kg;
  const latest = weights.at(-1)?.kg;
  return (
    <Screen>
      <Heading
        title="Your progress"
        detail="Workout totals and weight history."
      />
      <View style={s.row}>
        <Card style={{ flex: 1 }}>
          <Text style={s.small}>Completed sessions</Text>
          <Text style={s.metric}>{workouts.length}</Text>
          <Text style={s.small}>
            {
              workouts.filter((w) => new Date(w.finishedAt!) >= weekStart())
                .length
            }{' '}
            this week
          </Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={s.small}>Volume lifted</Text>
          <Text style={s.metric}>
            {(workouts.reduce((n, w) => n + volume(w), 0) / 1000).toFixed(1)}
            <Text style={s.small}> t</Text>
          </Text>
          <Text style={s.small}>Completed sets</Text>
        </Card>
      </View>
      <Section
        title="Body weight"
        action="Log weight"
        onPress={() => router.push('/weight')}
      />
      <Card>
        <Text style={s.metric}>
          {latest !== undefined
            ? formatWeight(latest, units)
            : 'No entries yet'}
        </Text>
        {latest !== undefined && first !== undefined ? (
          <Text style={s.small}>
            {formatWeight(latest - first, units)} change across your saved
            measurements
          </Text>
        ) : null}
        <WeightTrend entries={entries} units={units} />
      </Card>
      <Section title="Weight history" />
      <Card>
        {entries.length ? (
          [...entries].reverse().map((e) => (
            <View
              key={e.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 8,
              }}
            >
              <Text style={s.body}>
                {new Date(e.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              <Text style={s.rowTitle}>{formatWeight(e.kg, units)}</Text>
            </View>
          ))
        ) : (
          <Text style={s.body}>
            Your first logged check-in will appear here. Forma does not invent
            measurements.
          </Text>
        )}
      </Card>
      <Button
        secondary
        label="Workout history"
        onPress={() => router.push('/history')}
      />
      {data.demoRecords?.weightIds.length ||
      data.demoRecords?.workoutIds.length ? (
        <Text style={s.small}>
          Older demonstration records are preserved and labelled as examples.
          They are excluded from these personal totals.
        </Text>
      ) : null}
      {data.demoRecords?.weightIds.length ? (
        <Card>
          <Text style={s.sectionTitle}>Example weight records</Text>
          <Text style={s.small}>
            Demonstration data from the earlier app version · not personal
            measurements.
          </Text>
          {data.weights
            .filter((w) => data.demoRecords?.weightIds.includes(w.id))
            .map((w) => (
              <Text key={w.id} style={s.small}>
                {new Date(w.date).toLocaleDateString('en-GB')} ·{' '}
                {formatWeight(w.kg, units)}
              </Text>
            ))}
        </Card>
      ) : null}
    </Screen>
  );
}
