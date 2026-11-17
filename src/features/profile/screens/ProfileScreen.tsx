import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Heading, Screen, Section, s } from '@/components/ui';
import { useData } from '@/lib/store';
import {
  experienceLabels,
  goalLabels,
  guidanceDescriptions,
  guidanceLabels,
} from '@/features/onboarding/services/preferences';
export default function ProfileScreen() {
  const { data } = useData();
  const { saved } = useLocalSearchParams<{ saved?: string }>();
  const p = data?.onboarding?.preferences;
  const plan = data?.onboarding?.acceptedPlan;
  return (
    <Screen>
      <Heading
        eyebrow="YOUR TRAINING PREFERENCES"
        title="Profile"
        detail="Build a week that fits your life."
      />
      {saved === 'preferences' ? (
        <Text accessibilityRole="alert" style={s.link}>
          Preferences saved. Your routines are unchanged.
        </Text>
      ) : null}
      {saved === 'plan' ? (
        <Card>
          <Text accessibilityRole="alert" style={s.rowTitle}>
            Your plan is saved.
          </Text>
          <Text style={s.body}>
            New routines are ready to start. Your previous routines and workout
            history are still here.
          </Text>
          <Button
            label="View routines"
            onPress={() => router.push('/routines')}
          />
        </Card>
      ) : null}
      {p ? (
        <>
          <Section title="Your preferences" />
          <Card>
            {[
              ['Goal', goalLabels[p.goal]],
              ['Experience', experienceLabels[p.experience]],
              ['Schedule', `${p.days} days / week · ${p.duration} minutes`],
              [
                'Equipment',
                p.equipmentKnowledge === 'unsure'
                  ? 'Not sure yet · equipment-free starter'
                  : p.equipment.join(', '),
              ],
              ['Guidance', guidanceLabels[p.guidance]],
            ].map(([label, value]) => (
              <View key={label} style={{ gap: 5, paddingVertical: 6 }}>
                <Text style={s.small}>{label}</Text>
                <Text style={s.rowTitle}>{value}</Text>
              </View>
            ))}
          </Card>
          <Text style={s.body}>{guidanceDescriptions[p.guidance]}</Text>
        </>
      ) : (
        <Card>
          <Text style={s.sectionTitle}>Make Forma yours</Text>
          <Text style={s.body}>
            Set your goals, time and equipment to get a practical starting plan.
            You can also keep training independently.
          </Text>
        </Card>
      )}
      <Button
        label={
          p
            ? 'Update preferences or generate a plan'
            : 'Set up training preferences'
        }
        onPress={() => router.push('/onboarding')}
      />
      {plan ? (
        <>
          <Section title="Last accepted plan" />
          <Card>
            <Text style={s.sectionTitle}>{plan.title}</Text>
            <Text style={s.body}>
              Accepted {new Date(plan.acceptedAt).toLocaleDateString('en-GB')} ·{' '}
              {
                plan.routineIds.filter((id) =>
                  data?.routines.some((r) => r.id === id),
                ).length
              }{' '}
              routines in your library
            </Text>
            <Text style={s.small}>
              Changing preferences does not change this plan. A newly accepted
              plan is added to your library.
            </Text>
          </Card>
        </>
      ) : null}
      <Text style={s.small}>
        Preferences and training data are stored on this device.
      </Text>
    </Screen>
  );
}
