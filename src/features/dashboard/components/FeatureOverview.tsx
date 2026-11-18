import { useTheme } from '@/theme/provider';
import { router } from 'expo-router';
import {
  BookOpen,
  Dumbbell,
  Library,
  Scale,
  Users,
  ChartNoAxesCombined,
} from 'lucide-react-native';
import { ListRow } from '@/components/ui';

const features = [
  {
    title: 'Learn fitness basics',
    detail: 'Read short, practical guides',
    route: '/learn',
    Icon: BookOpen,
  },
  {
    title: 'Plan your training',
    detail: 'Browse routines or build a starting plan',
    route: '/routines',
    Icon: Dumbbell,
  },
  {
    title: 'Explore exercises',
    detail: 'Search movements and execution instructions',
    route: '/exercises',
    Icon: Library,
  },
  {
    title: 'Track a check-in',
    detail: 'Log weight in your preferred units',
    route: '/weight',
    Icon: Scale,
  },
  {
    title: 'Review your progress',
    detail: 'Your charts and completed sessions',
    route: '/progress',
    Icon: ChartNoAxesCombined,
  },
  {
    title: 'Nutrition, explained',
    detail: 'Education now · food tracking later',
    route: '/learn',
    params: { topic: 'nutrition' },
    Icon: BookOpen,
  },
  {
    title: 'Find your people',
    detail: 'Your preferences · matching comes later',
    route: '/community',
    Icon: Users,
  },
] as const;
export function FeatureOverview() {
  const { colors: c } = useTheme();

  return (
    <>
      {features.map(({ title, detail, route, Icon, ...rest }) => (
        <ListRow
          key={title}
          title={title}
          detail={detail}
          icon={<Icon size={20} color={c.primary} />}
          onPress={() =>
            router.push(
              'params' in rest
                ? { pathname: route, params: rest.params }
                : route,
            )
          }
        />
      ))}
    </>
  );
}
