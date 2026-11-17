import { Redirect, Tabs } from 'expo-router';
import {
  House,
  UserRound,
  Dumbbell,
  Library,
  ChartNoAxesCombined,
} from 'lucide-react-native';
import { colors } from '@/theme';
import { useData } from '@/lib/store';
export default function TabsLayout() {
  const { data } = useData();
  if (!data?.onboarding || data.onboarding.status === 'pending')
    return <Redirect href="/onboarding" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: colors.line,
          height: 82,
          paddingTop: 10,
          paddingBottom: 20,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: 'Routines',
          tabBarIcon: ({ color, size }) => (
            <Dumbbell color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color, size }) => (
            <Library color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <ChartNoAxesCombined color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <UserRound color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
