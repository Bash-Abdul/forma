import { fonts } from '@/theme/typography';
import { useTheme } from '@/theme/provider';
import { Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import {
  BookOpen,
  ClipboardList,
  Dumbbell,
  ChartNoAxesCombined,
  Apple,
  Users,
} from 'lucide-react-native';
import { Button, Heading, Screen, useUiStyles } from '@/components/ui';
import { useData, useSave } from '@/lib/store';
import {
  entryRoute,
  skipFitnessOnboarding,
} from '@/features/profile/services/fitnessProfile';

const capabilities = [
  {
    title: 'Learn',
    text: 'Fitness fundamentals, explained simply.',
    Icon: BookOpen,
  },
  {
    title: 'Plan',
    text: 'A starting point that fits your week.',
    Icon: ClipboardList,
  },
  {
    title: 'Train',
    text: 'Understand movements and log sessions.',
    Icon: Dumbbell,
  },
  {
    title: 'Track',
    text: 'Notice changes in your own records.',
    Icon: ChartNoAxesCombined,
  },
  {
    title: 'Manage nutrition',
    text: 'Learn food basics. Meal tracking comes later.',
    Icon: Apple,
  },
  {
    title: 'Connect',
    text: 'Share your preferences. Buddy matching comes later.',
    Icon: Users,
  },
];
export default function WelcomeScreen() {
  const s = useUiStyles();
  const { colors: c } = useTheme();

  const { data } = useData();
  const save = useSave();
  if (!data) return null;
  if (entryRoute(data.fitnessProfile) === '/') return <Redirect href="/" />;
  const resume = data.fitnessProfile.onboarding.status === 'in-progress';
  return (
    <Screen
      footer={
        <>
          {' '}
          <Button
            label={resume ? 'Resume setup' : 'Get started'}
            onPress={() => router.replace('/onboarding')}
          />
          <Button
            secondary
            label="Skip & explore"
            disabled={save.isPending}
            onPress={() =>
              void save
                .mutateAsync((d) => skipFitnessOnboarding(d))
                .then(() => router.replace('/'))
                .catch(() => undefined)
            }
          />
        </>
      }
    >
      <Text
        style={{
          fontSize: 32,
          fontFamily: fonts.semibold,
          letterSpacing: -1.7,
          color: c.primary,
          marginTop: 20,
        }}
      >
        forma.
      </Text>
      <Heading
        title={resume ? 'Pick up where you left off.' : 'Welcome to Forma.'}
        detail={
          resume
            ? 'Your answers are saved on this device. Continue setup, or explore Forma for now.'
            : 'Plan workouts, log sessions and learn the basics. Choose what you want to focus on.'
        }
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
        {capabilities.map(({ title, text, Icon }) => (
          <View
            key={title}
            style={{ width: '45%', gap: 9, paddingVertical: 8 }}
          >
            <Icon size={23} color={c.primary} />
            <Text style={s.sectionTitle}>{title}</Text>
            <Text style={s.small}>{text}</Text>
          </View>
        ))}
      </View>
      {save.isError ? (
        <Text style={s.error}>
          Couldn’t save your choice. Please try again.
        </Text>
      ) : null}
      <Text style={s.small}>
        A short setup, shaped around your interests. No account, location or
        body measurements needed to explore.
      </Text>
    </Screen>
  );
}
