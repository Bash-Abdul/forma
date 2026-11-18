import { Text } from 'react-native';
import { router } from 'expo-router';
import {
  Back,
  Button,
  Card,
  Heading,
  Screen,
  useUiStyles,
} from '@/components/ui';
import { useData } from '@/lib/store';
export default function CommunityScreen() {
  const s = useUiStyles();

  const { data } = useData();
  const preferences = data?.fitnessProfile.community;
  return (
    <Screen>
      <Back />
      <Heading
        title="Training together"
        detail="Finding a training buddy is a future part of Forma."
      />
      <Card>
        <Text style={s.sectionTitle}>
          Partner matching is not available yet
        </Text>
        <Text style={s.body}>
          There are no live profiles, messages or matching results in this
          version. For now, your preferences help us understand the kind of
          training experience you want.
        </Text>
        <Text style={s.body}>
          You could begin by asking a friend to join a session, or asking gym
          staff about a suitable class. Agree on expectations and choose a
          setting where you feel comfortable.
        </Text>
        <Text style={s.small}>
          No location permission is needed or requested.
        </Text>
      </Card>
      {preferences?.style || preferences?.setting ? (
        <Card>
          <Text style={s.sectionTitle}>Your preferences</Text>
          <Text style={s.body}>
            Company: {preferences.style ?? 'Not chosen yet'} · Setting:{' '}
            {preferences.setting ?? 'No preference'}
          </Text>
        </Card>
      ) : null}
      <Button
        label="Update my interests and preferences"
        onPress={() => router.push('/onboarding')}
      />
      <Button
        secondary
        label="Explore routines"
        onPress={() => router.push('/routines')}
      />
    </Screen>
  );
}
