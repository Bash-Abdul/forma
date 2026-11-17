import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Dumbbell, Plus, ArrowUpRight } from 'lucide-react-native';
import { Button, Card, Empty, Heading, Screen, s } from '@/components/ui';
import { useData, useSave } from '@/lib/store';
import { startWorkout } from '@/lib/training';
import { colors as c } from '@/theme';
export default function RoutinesScreen() {
  const { data } = useData();
  const save = useSave();
  if (!data) return null;
  return (
    <Screen>
      <Heading
        eyebrow="YOUR TRAINING, YOUR WAY"
        title="Routines"
        detail="A plan to come back to. Progress to build on."
      />
      <Card style={{ backgroundColor: c.pale, borderColor: c.pale }}>
        <Text style={s.sectionTitle}>
          {data.onboarding?.acceptedPlan?.title ?? 'Your routine library'}
        </Text>
        <Text style={s.body}>
          {data.onboarding?.acceptedPlan
            ? 'Your accepted plan is ready. All previous routines remain available below.'
            : 'Create your own routine or build a starting plan from your training preferences.'}
        </Text>
        <Button
          secondary
          label="Training preferences"
          onPress={() => router.push('/profile')}
        />
      </Card>
      {data.routines.map((routine, i) => (
        <Card key={routine.id}>
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <View style={s.iconBox}>
              <Dumbbell size={23} color={c.primary} />
            </View>
            <Text style={s.small}>
              {
                ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][
                  routine.day - 1
                ]
              }{' '}
              · DAY {i + 1}
            </Text>
          </View>
          <Text style={[s.sectionTitle, { fontSize: 23 }]}>{routine.name}</Text>
          <Text style={s.body}>{routine.subtitle}</Text>
          <Text style={s.small}>
            {routine.exercises.length} exercises ·{' '}
            {routine.exercises.reduce((n, e) => n + e.sets, 0)} planned sets
          </Text>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Button
                label={data.active ? 'Resume workout' : 'Start workout'}
                disabled={!routine.exercises.length || save.isPending}
                onPress={() => {
                  if (data.active) {
                    router.push('/workout');
                    return;
                  }
                  void save
                    .mutateAsync((d) => ({
                      ...d,
                      active: startWorkout(routine),
                    }))
                    .then(() => router.push('/workout'))
                    .catch(() => undefined);
                }}
              />
            </View>
            <Button
              label="Edit"
              secondary
              onPress={() =>
                router.push({
                  pathname: '/routine',
                  params: { id: routine.id },
                })
              }
              icon={<ArrowUpRight size={16} color={c.primary} />}
            />
          </View>
        </Card>
      ))}
      {!data.routines.length ? (
        <Empty
          title="Make it your own"
          detail="Create your first routine and add exercises from the library."
        />
      ) : null}
      {save.isError ? (
        <Text style={s.error}>Couldn’t save. Please try again.</Text>
      ) : null}
      <Button
        label="Create routine"
        secondary
        icon={<Plus size={18} color={c.primary} />}
        onPress={() => router.push('/routine')}
      />
    </Screen>
  );
}
