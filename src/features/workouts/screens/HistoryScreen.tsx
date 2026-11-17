import { router } from 'expo-router';
import { Dumbbell } from 'lucide-react-native';
import { Back, Card, Empty, Heading, ListRow, Screen } from '@/components/ui';
import { useData } from '@/lib/store';
import { volume } from '@/lib/training';
import { colors } from '@/theme';
export default function HistoryScreen() {
  const { data } = useData();
  return (
    <Screen>
      <Back />
      <Heading
        eyebrow="THE WORK YOU’VE PUT IN"
        title="Workout history"
        detail="Every session is a step forward."
      />
      {data?.workouts.length ? (
        [...data.workouts].reverse().map((w) => (
          <Card key={w.id}>
            <ListRow
              title={w.name}
              detail={`${new Date(w.finishedAt!).toLocaleDateString('en-GB')} · ${volume(w).toLocaleString()} kg volume`}
              icon={<Dumbbell size={20} color={colors.primary} />}
              onPress={() =>
                router.push({ pathname: '/workout', params: { id: w.id } })
              }
            />
          </Card>
        ))
      ) : (
        <Empty
          title="Your story starts here"
          detail="Complete a workout to see it in your history."
        />
      )}
    </Screen>
  );
}
