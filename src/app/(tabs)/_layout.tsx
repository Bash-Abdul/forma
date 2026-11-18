import { fonts } from '@/theme/typography';
import { useTheme } from '@/theme/provider';
import { useCallback } from 'react';
import { router, Tabs, useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppData } from '@/types';
import {
  House,
  UserRound,
  Dumbbell,
  Library,
  ChartNoAxesCombined,
} from 'lucide-react-native';

import { entryRoute } from '@/features/profile/services/fitnessProfile';
export default function TabsLayout() {
  const { colors: colors } = useTheme();

  const client = useQueryClient();
  useFocusEffect(
    useCallback(() => {
      // A background tab layout must not redirect using a stale pre-completion render.
      const current = client.getQueryData<AppData>(['forma']);
      if (current && entryRoute(current.fitnessProfile) === '/welcome')
        router.replace('/welcome');
    }, [client]),
  );
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
          height: 90,
          paddingTop: 10,
          paddingBottom: 20,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          lineHeight: 14,
          fontFamily: fonts.semibold,
          marginTop: 4,
        },
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
