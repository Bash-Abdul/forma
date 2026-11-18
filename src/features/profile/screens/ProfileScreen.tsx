import { AppearanceSettings } from '../components/AppearanceSettings';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Button,
  Card,
  Heading,
  Screen,
  Section,
  useUiStyles,
} from '@/components/ui';
import { useData } from '@/lib/store';
import {
  experienceLabels,
  goalLabels,
  guidanceLabels,
} from '@/features/onboarding/services/preferences';
import { interests } from '../services/fitnessProfile';
import { formatWeight, toDisplayHeight } from '../services/measurements';
export default function ProfileScreen() {
  const s = useUiStyles();

  const { data } = useData();
  const { saved } = useLocalSearchParams<{ saved?: string }>();
  if (!data) return null;
  const p = data.fitnessProfile;
  const training = p.training ?? data.onboarding?.preferences;
  const plan = data.onboarding?.acceptedPlan;
  const selected = interests.filter((i) => p.interests.includes(i.value));
  return (
    <Screen>
      <Heading title="Profile" detail="Preferences and saved details." />
      <AppearanceSettings />
      <View style={s.divider} />
      {saved ? (
        <Card>
          <Text accessibilityRole="alert" style={s.rowTitle}>
            {saved === 'plan'
              ? 'Your training plan is saved.'
              : 'Preferences saved.'}
          </Text>
          <Text style={s.body}>
            Existing routines and workout history are still available.
          </Text>
          <Button
            secondary
            label="View routines"
            onPress={() => router.push('/routines')}
          />
        </Card>
      ) : null}
      <Section title="Interests" />
      <Card>
        {selected.length ? (
          selected.map((i) => (
            <Text key={i.value} style={s.rowTitle}>
              {i.label}
            </Text>
          ))
        ) : (
          <Text style={s.body}>
            You’re exploring. Choose a few interests whenever you’re ready.
          </Text>
        )}
        <View style={s.divider} />
        <Text style={s.body}>
          {experienceLabels[p.experience]} · {guidanceLabels[p.guidance]}
        </Text>
        {p.weightGoal ? (
          <Text style={s.body}>
            Weight goal:{' '}
            {p.weightGoal === 'lose'
              ? 'Lose'
              : p.weightGoal === 'gain'
                ? 'Gain'
                : 'Maintain'}{' '}
            weight
          </Text>
        ) : null}
        <Text style={s.small}>
          Setup:{' '}
          {p.onboarding.status === 'complete'
            ? 'Complete'
            : p.onboarding.status === 'skipped'
              ? 'Exploring for now'
              : 'In progress · answers saved locally'}
        </Text>
      </Card>
      <Button
        label={
          p.onboarding.status === 'in-progress'
            ? 'Resume setup'
            : 'Update interests & profile'
        }
        onPress={() => router.push('/onboarding')}
      />
      {Object.values(p.metrics).some((v) => v !== undefined) ? (
        <>
          <Section title="Starting details" />
          <Card>
            {p.metrics.age !== undefined ? (
              <Text style={s.body}>Age: {p.metrics.age}</Text>
            ) : null}
            {p.metrics.heightCm !== undefined ? (
              <Text style={s.body}>
                Height:{' '}
                {Number(
                  toDisplayHeight(p.metrics.heightCm, p.units).toFixed(1),
                )}{' '}
                {p.units === 'metric' ? 'cm' : 'inches'}
              </Text>
            ) : null}
            {p.metrics.weightKg !== undefined ? (
              <Text style={s.body}>
                Starting weight: {formatWeight(p.metrics.weightKg, p.units)}
              </Text>
            ) : null}
            {p.metrics.goalWeightKg !== undefined ? (
              <Text style={s.body}>
                Chosen goal weight:{' '}
                {formatWeight(p.metrics.goalWeightKg, p.units)}
              </Text>
            ) : null}
            <Text style={s.small}>
              Profile measurements are kept separately from your logged weight
              history.
            </Text>
          </Card>
        </>
      ) : null}
      {training ? (
        <>
          <Section title="Training preferences" />
          <Card>
            {[
              ['Goal', goalLabels[training.goal]],
              [
                'Week',
                `${training.days} days · ${training.duration} minutes per session`,
              ],
              [
                'Equipment',
                training.equipmentKnowledge === 'unsure'
                  ? 'Not sure yet · equipment-free starter'
                  : training.equipment.join(', '),
              ],
            ].map(([label, value]) => (
              <View key={label} style={{ gap: 4 }}>
                <Text style={s.small}>{label}</Text>
                <Text style={s.rowTitle}>{value}</Text>
              </View>
            ))}
          </Card>
        </>
      ) : null}
      <Button
        secondary
        label="Training plan & preferences"
        onPress={() => router.push('/training-setup')}
      />
      {plan ? (
        <Card>
          <Text style={s.sectionTitle}>{plan.title}</Text>
          <Text style={s.body}>
            Accepted {new Date(plan.acceptedAt).toLocaleDateString('en-GB')} ·{' '}
            {
              plan.routineIds.filter((id) =>
                data.routines.some((r) => r.id === id),
              ).length
            }{' '}
            routines in your library
          </Text>
          <Text style={s.small}>
            Updating your fitness profile does not replace this plan or change
            past workouts.
          </Text>
        </Card>
      ) : null}
      <Button
        secondary
        label="Browse learning"
        onPress={() => router.push('/learn')}
      />
      <Text style={s.small}>
        Measurements use {p.units === 'metric' ? 'kg and cm' : 'lb and inches'}.
        All preferences and records stay on this device. You can use every
        feature regardless of your interests.
      </Text>
    </Screen>
  );
}
