import { fonts } from '@/theme/typography';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, BookOpen, UserRound } from 'lucide-react-native';
import {
  Button,
  Card,
  Heading,
  ListRow,
  Screen,
  Section,
  useUiStyles,
} from '@/components/ui';
import { useData, useSave } from '@/lib/store';
import { activateRoutine } from '@/lib/training';
import { Palette } from '@/theme';
import { useTheme, useThemedStyles } from '@/theme/provider';
import { formatWeight } from '@/features/profile/services/measurements';
import {
  articles,
  recommendedArticles,
} from '@/features/learn/services/articles';
import { homeSections, homeSummary } from '../services';
import { WeightTrend } from '@/features/progress/components/WeightTrend';
import { WeekCalendar } from '../components/WeekCalendar';

export default function DashboardScreen() {
  const { data } = useData();
  const save = useSave();
  const { colors: c } = useTheme();
  const s = useUiStyles();
  const styles = useThemedStyles(createStyles);
  if (!data) return null;
  const p = data.fitnessProfile;
  const summary = homeSummary(data);
  const sections = homeSections(data);
  const first = sections[0];
  const trainingHero =
    Boolean(data.active) || first === 'training' || first === 'explore';
  const guide = recommendedArticles(p)[0];
  const hero = trainingHero
    ? {
        label: data.active
          ? 'IN PROGRESS'
          : summary.next
            ? 'NEXT WORKOUT'
            : 'YOUR TRAINING',
        title:
          data.active?.name ??
          (p.guidance === 'independent'
            ? 'Choose a session'
            : (summary.next?.name ?? 'Choose a session')),
        detail: data.active
          ? 'Your logged sets are saved. Pick up where you left off.'
          : summary.next
            ? `${summary.next.exercises.length} exercises · ${summary.next.exercises.reduce((n, e) => n + e.sets, 0)} sets`
            : 'Browse the templates or build your own session.',
        action: data.active
          ? 'Resume workout'
          : summary.next && p.guidance !== 'independent'
            ? 'Start workout'
            : 'View routines',
      }
    : first === 'weight' || first === 'progress'
      ? {
          label: 'YOUR NEXT CHECK-IN',
          title: 'Weight check-in',
          detail: summary.latestWeight
            ? `Last entry: ${formatWeight(summary.latestWeight.kg, p.units)}`
            : 'Log a measurement whenever you’re ready.',
          action: 'Log weight',
        }
      : first === 'community'
        ? {
            label: 'TRAINING TOGETHER',
            title: 'Training together',
            detail:
              'Explore training-together preferences. Matching is coming later.',
            action: 'View preferences',
          }
        : {
            label: 'FROM THE LIBRARY',
            title: guide?.title ?? 'Fitness basics',
            detail: guide
              ? `${guide.minutes} minutes · ${guide.topic}`
              : 'Practical guides to get started.',
            action: 'Read guide',
          };
  async function begin(): Promise<void> {
    if (!data) return;
    if (data.active) {
      router.push('/workout');
      return;
    }
    if (p.guidance === 'independent' || !summary.next) {
      router.push('/routines');
      return;
    }
    try {
      await save.mutateAsync((d) => activateRoutine(d, summary.next!));
      router.push('/workout');
    } catch {
      /* Inline feedback below. */
    }
  }
  function openHero(): void {
    if (trainingHero) {
      void begin();
      return;
    }
    if (first === 'weight' || first === 'progress') {
      router.push('/weight');
      return;
    }
    if (first === 'community') {
      router.push('/community');
      return;
    }
    router.push(
      guide ? { pathname: '/article', params: { id: guide.id } } : '/learn',
    );
  }
  return (
    <Screen>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>
          forma<Text style={{ color: c.primary }}>.</Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.push('/profile')}
          style={styles.profile}
        >
          <UserRound size={22} color={c.text} />
        </Pressable>
      </View>
      <Heading
        title="Your week."
        detail={new Date().toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      />
      <WeekCalendar data={data} />
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>{hero.label}</Text>
        <Text style={styles.heroTitle}>{hero.title}</Text>
        <Text style={styles.heroDetail}>{hero.detail}</Text>
        <Pressable
          accessibilityRole="button"
          disabled={save.isPending}
          accessibilityState={{ disabled: save.isPending }}
          onPress={openHero}
          style={({ pressed }) => [
            styles.heroAction,
            { opacity: save.isPending ? 0.4 : pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.heroActionText}>{hero.action}</Text>
          <ArrowRight size={19} color="#192C29" />
        </Pressable>
      </View>
      {save.isError ? (
        <Text accessibilityRole="alert" style={s.error}>
          Couldn’t start the workout. Please try again.
        </Text>
      ) : null}
      {p.onboarding.status !== 'complete' ? (
        <ListRow
          title="Finish your setup"
          detail="Your answers are saved."
          onPress={() => router.push('/onboarding')}
        />
      ) : null}
      {sections.includes('training') ? (
        <View style={styles.section}>
          <Section
            title="Training"
            action="Routines"
            onPress={() => router.push('/routines')}
          />
          {!trainingHero ? (
            <Card>
              <Text style={s.sectionTitle}>
                {summary.next?.name ?? 'Choose a routine'}
              </Text>
              <Button
                label={summary.next ? 'Start workout' : 'View routines'}
                disabled={save.isPending}
                onPress={() => void begin()}
              />
            </Card>
          ) : null}
          <View style={styles.stats}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.metric}>{summary.weekly.length}</Text>
              <Text style={s.small}>Sessions this week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.metric}>{summary.workouts.length}</Text>
              <Text style={s.small}>Sessions total</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/training-setup')}
            style={styles.textAction}
          >
            <Text style={s.link}>Training plan & preferences</Text>
            <ArrowRight size={16} color={c.primary} />
          </Pressable>
        </View>
      ) : null}
      {sections.includes('weight') ? (
        <View style={styles.section}>
          <Section
            title="Weight"
            action="Log weight"
            onPress={() => router.push('/weight')}
          />
          <Card>
            <View style={{ gap: 4 }}>
              <Text style={s.metric}>
                {summary.latestWeight
                  ? formatWeight(summary.latestWeight.kg, p.units)
                  : p.metrics.weightKg !== undefined
                    ? formatWeight(p.metrics.weightKg, p.units)
                    : 'No entries yet'}
              </Text>
              <Text style={s.small}>
                {summary.latestWeight
                  ? `Logged ${new Date(summary.latestWeight.date).toLocaleDateString('en-GB')}`
                  : p.metrics.weightKg !== undefined
                    ? 'Starting weight from your profile'
                    : 'Your first check-in will appear here.'}
              </Text>
            </View>
            {p.metrics.goalWeightKg !== undefined ? (
              <Text style={s.small}>
                Goal · {formatWeight(p.metrics.goalWeightKg, p.units)}
              </Text>
            ) : null}
            <WeightTrend entries={summary.weights} units={p.units} />
          </Card>
          {p.activity.level || p.activity.steps !== undefined ? (
            <Text style={s.small}>
              Activity estimate from setup
              {p.activity.steps !== undefined
                ? ` · ${p.activity.steps.toLocaleString()} steps/day`
                : ` · ${p.activity.level}`}
              . Not measured today.
            </Text>
          ) : null}
        </View>
      ) : null}
      {summary.recent.length &&
      (sections.includes('training') || sections.includes('progress')) ? (
        <View style={styles.section}>
          <Section
            title="Recent sessions"
            action="History"
            onPress={() => router.push('/history')}
          />
          {summary.recent.slice(0, 2).map((w) => (
            <ListRow
              key={w.id}
              title={w.name}
              detail={new Date(w.finishedAt!).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}
              onPress={() =>
                router.push({ pathname: '/workout', params: { id: w.id } })
              }
            />
          ))}
        </View>
      ) : null}
      {sections.includes('progress') ? (
        <ListRow
          title="Your progress"
          detail={`${summary.workouts.length} sessions · ${summary.weights.length} weight entries`}
          onPress={() => router.push('/progress')}
        />
      ) : null}
      {sections.includes('learn') || sections.includes('nutrition') ? (
        <View style={styles.section}>
          <Section
            title={
              sections.includes('learn')
                ? 'From the library'
                : 'Nutrition basics'
            }
            action="All guides"
            onPress={() => router.push('/learn')}
          />
          {(sections.includes('learn')
            ? recommendedArticles(p)
            : articles.filter((a) => a.topic === 'nutrition')
          )
            .slice(0, 2)
            .map((a) => (
              <ListRow
                key={a.id}
                title={a.title}
                detail={`${a.minutes} min read`}
                icon={<BookOpen size={20} color={c.primary} />}
                onPress={() =>
                  router.push({ pathname: '/article', params: { id: a.id } })
                }
              />
            ))}
        </View>
      ) : null}
      {sections.includes('community') && first !== 'community' ? (
        <ListRow
          title="Training together"
          detail="Preferences now · matching coming later"
          onPress={() => router.push('/community')}
        />
      ) : null}
      <View style={s.divider} />
      <ListRow
        title="Explore Forma"
        detail="Exercises, learning, routines and more"
        onPress={() => router.push('/explore')}
      />
    </Screen>
  );
}
const createStyles = (c: Palette) =>
  StyleSheet.create({
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brand: {
      fontSize: 30,
      fontFamily: fonts.semibold,
      letterSpacing: -1.6,
      color: c.text,
    },
    profile: {
      minHeight: 44,
      minWidth: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    section: { gap: 12 },
    hero: { padding: 24, gap: 16, backgroundColor: c.hero, borderRadius: 3 },
    heroLabel: {
      color: c.heroMuted,
      fontSize: 10,
      letterSpacing: 1.6,
      fontFamily: fonts.semibold,
    },
    heroTitle: {
      color: c.onHero,
      fontSize: 40,
      fontFamily: fonts.display,
      letterSpacing: 0,
      lineHeight: 44,
    },
    heroDetail: {
      fontFamily: fonts.regular,
      color: c.heroMuted,
      fontSize: 14,
      lineHeight: 21,
    },
    heroAction: {
      backgroundColor: c.lime,
      minHeight: 48,
      padding: 14,
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 2,
      gap: 12,
    },
    heroActionText: {
      color: '#192C29',
      fontSize: 14,
      fontFamily: fonts.semibold,
      flexShrink: 1,
    },
    stats: { flexDirection: 'row', paddingVertical: 14, gap: 24 },
    statDivider: { width: 1, backgroundColor: c.line },
    textAction: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 44,
    },
  });
