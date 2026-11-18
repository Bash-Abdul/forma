import { useTheme } from '@/theme/provider';
import { router } from 'expo-router';
import { Dumbbell } from 'lucide-react-native';
import { Back, Card, Empty, Heading, ListRow, Screen } from '@/components/ui';
import { useData } from '@/lib/store';
import { volume } from '@/lib/training';

export default function HistoryScreen() {
  const { colors: colors } = useTheme();

  const { data } = useData();
  return (
    <Screen>
      <Back />
      <Heading
        title="Workout history"
        detail="Every session is a step forward."
      />
      {data?.workouts.length ? (
        [...data.workouts].reverse().map((w) => (
          <Card key={w.id}>
            <ListRow
              title={w.name}
              detail={`${data?.demoRecords?.workoutIds.includes(w.id) ? 'Example session · ' : ''}${new Date(w.finishedAt!).toLocaleDateString('en-GB')} · ${volume(w).toLocaleString()} kg volume`}
              icon={<Dumbbell size={20} color={colors.primary} />}
              onPress={() =>
                router.push({ pathname: '/workout', params: { id: w.id } })
              }
            />
          </Card>
        ))
      ) : (
        <Empty
          title="No workouts yet"
          detail="Complete a workout to see it in your history."
        />
      )}
    </Screen>
  );
}
