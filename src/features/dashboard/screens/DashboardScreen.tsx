import { Text, View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  ArrowRight,
  Dumbbell,
  Flame,
  Scale,
  Check,
  CalendarDays,
  Activity,
} from 'lucide-react-native';
import {
  Button,
  Card,
  Heading,
  ListRow,
  Screen,
  Section,
  s,
} from '@/components/ui';
import { colors as c } from '@/theme';
import { useData, useSave } from '@/lib/store';
import { nextRoutine, startWorkout, weekStart } from '@/lib/training';
import { trainingRoutines } from '@/features/onboarding/services/profile';
export default function DashboardScreen() {
  const { data } = useData();
  const save = useSave();
  if (!data) return null;
  const currentRoutines = trainingRoutines(data);
  const next = nextRoutine(currentRoutines);
  const target =
    data.onboarding?.acceptedPlan?.days ??
    data.onboarding?.preferences?.days ??
    4;
  const start = weekStart();
  const weekly = data.workouts.filter((w) => new Date(w.finishedAt!) >= start);
  const weight = data.weights.at(-1);
  const recent = [...data.workouts].reverse().slice(0, 3);
  const guidance = data.onboarding?.preferences?.guidance;
  const begin = async () => {
    if (data.active) {
      router.push('/workout');
      return;
    }
    if (guidance === 'independent') {
      router.push('/routines');
      return;
    }
    if (next) {
      try {
        await save.mutateAsync((d) => ({ ...d, active: startWorkout(next) }));
        router.push('/workout');
      } catch {
        /* error is rendered below */
      }
    } else router.push('/routine');
  };
  return (
    <Screen>
      <View style={styles.brandRow}>
        <View style={s.row}>
          <View style={styles.logo}>
            <Activity color="white" size={22} />
          </View>
          <Text style={styles.brand}>
            forma<Text style={{ color: c.primary }}>.</Text>
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.push('/profile')}
          style={styles.avatar}
        >
          <Text style={{ color: c.primary, fontWeight: '700' }}>Y</Text>
        </Pressable>
      </View>
      <Heading
        eyebrow={new Date()
          .toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })
          .toUpperCase()}
        title="A little stronger, every day."
        detail="Show up for yourself. We’ll keep track."
      />
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.pill}>
            <View style={styles.dot} />
            <Text style={styles.pillText}>
              {data.active
                ? 'WORKOUT IN PROGRESS'
                : guidance === 'independent'
                  ? 'YOUR TRAINING'
                  : guidance === 'flexible'
                    ? 'SUGGESTED WORKOUT'
                    : 'YOUR NEXT WORKOUT'}
            </Text>
          </View>
          <Dumbbell color="#B9D3B7" size={26} />
        </View>
        <Text style={styles.heroTitle}>
          {data.active?.name ??
            (guidance === 'independent'
              ? 'Choose today’s workout'
              : (next?.name ?? 'Your journey starts here'))}
        </Text>
        <Text style={styles.heroSub}>
          {guidance === 'independent' && !data.active
            ? 'Your routines, on your schedule.'
            : next
              ? `${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][next.day - 1]}  ·  ${next.exercises.length} exercises  ·  ${next.exercises.reduce((n, e) => n + e.sets, 0)} sets`
              : 'Create a routine that works for you.'}
        </Text>
        <View style={styles.heroDivider} />
        <View style={styles.heroBottom}>
          <View>
            <Text style={styles.heroCaption}>YOUR PROGRAMME</Text>
            <Text style={styles.heroProgramme}>
              {data.onboarding?.acceptedPlan?.title ?? 'Your routine library'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              data.active
                ? 'Resume workout'
                : guidance === 'independent'
                  ? 'Choose a routine'
                  : 'Start workout'
            }
            disabled={save.isPending}
            onPress={() => void begin()}
            style={styles.start}
          >
            <ArrowRight size={24} color={c.text} />
          </Pressable>
        </View>
      </View>
      {save.isError ? (
        <Text style={s.error}>
          Couldn’t start your workout. Please try again.
        </Text>
      ) : null}
      <Section
        title="This week"
        action="View progress"
        onPress={() => router.push('/progress')}
      />
      <Card>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <View style={s.row}>
            <View style={s.iconBox}>
              <Flame color={c.primary} size={21} />
            </View>
            <View>
              <Text style={s.rowTitle}>Building momentum</Text>
              <Text style={s.small}>
                {weekly.length} of {target} workouts completed
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: c.primary }}>
            {Math.min(100, Math.round((weekly.length / target) * 100))}
            <Text style={s.small}>%</Text>
          </Text>
        </View>
        <View style={styles.days}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const done = weekly.some(
              (w) => (new Date(w.finishedAt!).getDay() + 6) % 7 === i,
            );
            const today = (new Date().getDay() + 6) % 7 === i;
            return (
              <View key={i} style={{ alignItems: 'center', gap: 9 }}>
                <Text style={s.small}>{day}</Text>
                <View
                  style={[
                    styles.day,
                    done && { backgroundColor: c.primary },
                    today &&
                      !done && { borderColor: c.primary, borderWidth: 1.5 },
                  ]}
                >
                  {done ? (
                    <Check size={16} color="white" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 12,
                        color: today ? c.primary : c.muted,
                      }}
                    >
                      {new Date(start.getTime() + i * 86400000).getDate()}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </Card>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1 }}>
          <Scale size={20} color={c.primary} />
          <Text style={s.small}>Latest weight</Text>
          <Text style={s.metric}>
            {weight?.kg ?? '—'} <Text style={s.small}>kg</Text>
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/weight')}
          >
            <Text style={s.link}>Log weight +</Text>
          </Pressable>
        </Card>
        <Card style={{ flex: 1 }}>
          <Dumbbell size={20} color={c.primary} />
          <Text style={s.small}>Total workouts</Text>
          <Text style={s.metric}>
            {data.workouts.length} <Text style={s.small}>sessions</Text>
          </Text>
          <Text style={s.small}>Every session counts.</Text>
        </Card>
      </View>
      <Section
        title="Recent activity"
        action="See all"
        onPress={() => router.push('/history')}
      />
      <Card style={{ paddingVertical: 5 }}>
        {recent.length ? (
          recent.map((w, i) => (
            <View key={w.id}>
              {i ? <View style={s.divider} /> : null}
              <ListRow
                title={w.name}
                detail={`${new Date(w.finishedAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}  ·  ${w.exercises.length} exercises  ·  Completed`}
                icon={<Dumbbell size={20} color={c.primary} />}
                onPress={() =>
                  router.push({ pathname: '/workout', params: { id: w.id } })
                }
              />
            </View>
          ))
        ) : (
          <Text style={[s.body, { padding: 12 }]}>
            Your first session is the start of something good.
          </Text>
        )}
      </Card>
      <View style={styles.note}>
        <CalendarDays size={18} color={c.primary} />
        <Text style={[s.small, { flex: 1 }]}>
          Consistency over perfection. One workout at a time.
        </Text>
      </View>
      <Button
        label={
          data.active
            ? 'Resume your workout'
            : guidance === 'independent'
              ? 'Choose a routine'
              : 'Let’s get moving'
        }
        onPress={() => void begin()}
        icon={<ArrowRight size={18} color="white" />}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    height: 33,
    width: 33,
    borderRadius: 10,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -1.4,
    color: c.text,
  },
  avatar: {
    height: 37,
    width: 37,
    borderRadius: 6,
    backgroundColor: '#E7ECDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    backgroundColor: '#225B4B',
    borderRadius: 10,
    padding: 24,
    gap: 16,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 7,
    borderRadius: 6,
  },
  dot: { height: 5, width: 5, backgroundColor: c.lime, borderRadius: 3 },
  pillText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#E6F0DF',
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: -0.8,
    color: 'white',
    marginTop: 5,
  },
  heroSub: { fontSize: 12, color: '#BDD1C8' },
  heroDivider: { height: 1, backgroundColor: '#477766', marginTop: 7 },
  heroBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroCaption: {
    fontSize: 8,
    letterSpacing: 1.6,
    color: '#A8C6B9',
    marginBottom: 7,
  },
  heroProgramme: { fontSize: 13, fontWeight: '500', color: 'white' },
  start: {
    backgroundColor: c.lime,
    width: 47,
    height: 47,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  day: {
    width: 32,
    height: 32,
    borderRadius: 18,
    backgroundColor: c.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  note: { flexDirection: 'row', gap: 10, padding: 5, alignItems: 'center' },
});
