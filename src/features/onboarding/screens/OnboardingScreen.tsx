import { useTheme } from '@/theme/provider';
import { Pressable, Text, View } from 'react-native';
import { Button, Card, Heading, Screen, useUiStyles } from '@/components/ui';
import { SelectionGroup } from '@/components/ui/SelectionGroup';

import { FitnessStep, LearningTopic, TrainingPreferences } from '@/types';
import {
  interests,
  canGeneratePlan,
} from '@/features/profile/services/fitnessProfile';
import { formatWeight } from '@/features/profile/services/measurements';
import {
  defaultPreferences,
  goalLabels,
  guidanceLabels,
} from '../services/preferences';
import { useFitnessOnboarding } from '../hooks/useFitnessOnboarding';
import { ScheduleStep } from '../components/ScheduleStep';
import { EquipmentStep } from '../components/EquipmentStep';
import { PersonalMetricsStep } from '../components/PersonalMetricsStep';
import { ActivityStep } from '../components/ActivityStep';
import { PlanReview } from '../components/PlanReview';
const titles: Record<FitnessStep, string> = {
  interests: 'What brings you to Forma?',
  experience: 'Let’s find your starting point.',
  eligibility: 'A little context, only where needed.',
  'weight-goal': 'What would you like to work towards?',
  metrics: 'Your starting point, if you’d like.',
  activity: 'What does a usual day look like?',
  learning: 'What would you like to understand?',
  community: 'How do you like to train?',
  'training-goal': 'What should training help you do?',
  schedule: 'Make room for training.',
  equipment: 'What can you train with?',
  review: 'A space shaped around you.',
};
const topicOptions: { value: LearningTopic; label: string }[] = [
  { value: 'fundamentals', label: 'Fitness fundamentals' },
  { value: 'strength', label: 'How strength training works' },
  { value: 'consistency', label: 'Building a routine I can repeat' },
  { value: 'weight', label: 'Understanding weight and progress' },
  { value: 'nutrition', label: 'Food, calories and macronutrients' },
];
export default function OnboardingScreen() {
  const s = useUiStyles();
  const { colors: c } = useTheme();

  const o = useFitnessOnboarding();
  const p = o.profile;
  const training = p.training ?? {
    ...defaultPreferences,
    experience: p.experience,
    guidance: p.guidance,
  };
  const index = o.steps.indexOf(o.current);
  const draft = p.onboarding.planDraft;
  const trainingRelevant =
    p.interests.includes('training') && canGeneratePlan(p);
  return (
    <Screen scrollKey={o.current}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={s.link}>
          YOUR FORMA · {index + 1} / {o.steps.length}
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={o.pending}
          onPress={() => void o.explore()}
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={s.link}>Explore for now</Text>
        </Pressable>
      </View>
      <View style={{ height: 3, backgroundColor: c.line }}>
        <View
          style={{
            height: 3,
            width: `${((index + 1) / o.steps.length) * 100}%`,
            backgroundColor: c.primary,
          }}
        />
      </View>
      <Heading
        title={titles[o.current]}
        detail={
          o.current === 'interests'
            ? 'Choose everything that interests you. These choices shape Home, but every feature stays open to you.'
            : undefined
        }
      />
      {o.current === 'interests' ? (
        <SelectionGroup
          multiple
          label="Your interests"
          options={[...interests]}
          value={p.interests}
          onChange={(value) =>
            o.update({
              interests: p.interests.includes(value)
                ? p.interests.filter((i) => i !== value)
                : [...p.interests, value],
            })
          }
        />
      ) : null}
      {o.current === 'experience' ? (
        <>
          <SelectionGroup
            label="How familiar are you with fitness?"
            value={p.experience}
            options={[
              {
                value: 'beginner',
                label: 'I’m new to fitness',
                detail:
                  'I’d appreciate explanations of the words, movements and choices.',
              },
              {
                value: 'intermediate',
                label: 'I know the basics',
                detail: 'I have some experience and want to build on it.',
              },
              {
                value: 'advanced',
                label: 'I feel confident with fitness',
                detail:
                  'I know my way around training and want a concise setup.',
              },
            ]}
            onChange={(experience) => o.update({ experience })}
          />
          <Text style={s.body}>
            You can be confident in the gym and still be new to nutrition. We’ll
            let you choose what to learn separately.
          </Text>
          <SelectionGroup
            label="How much guidance feels right?"
            value={p.guidance}
            options={[
              {
                value: 'guided',
                label: guidanceLabels.guided,
                detail: 'Explain the basics and suggest a clear next step.',
              },
              {
                value: 'flexible',
                label: guidanceLabels.flexible,
                detail: 'Offer ideas and let me choose what fits.',
              },
              {
                value: 'independent',
                label: guidanceLabels.independent,
                detail: 'Give me the tools; I’ll choose my own approach.',
              },
            ]}
            onChange={(guidance) => o.update({ guidance })}
          />
        </>
      ) : null}
      {o.current === 'eligibility' ? (
        <>
          <Text style={s.body}>
            Automatic training plans and personalised weight goals in this demo
            are for adults aged 18 and over. We ask an age group instead of your
            date of birth. You can explore learning and your existing records
            without sharing it.
          </Text>
          <SelectionGroup
            label="Are you 18 or older?"
            value={p.eligibility}
            options={[
              { value: 'adult', label: 'Yes, I’m 18 or older' },
              { value: 'under18', label: 'I’m under 18' },
              { value: 'unspecified', label: 'I’d rather not say' },
            ]}
            onChange={(eligibility) => o.update({ eligibility })}
          />
          {p.eligibility && p.eligibility !== 'adult' ? (
            <Card>
              <Text style={s.sectionTitle}>You can still explore.</Text>
              <Text style={s.body}>
                We’ll skip body measurements and automatic plan generation.
                Learn the fundamentals and keep access to the library and your
                records. For personalised advice as a young person, ask a
                qualified professional who works with your age group.
              </Text>
            </Card>
          ) : null}
        </>
      ) : null}
      {o.current === 'weight-goal' ? (
        <>
          <SelectionGroup
            label="Weight-related goal"
            value={p.weightGoal}
            options={[
              { value: 'lose', label: 'Lose weight' },
              { value: 'gain', label: 'Gain weight' },
              { value: 'maintain', label: 'Maintain my weight' },
            ]}
            onChange={(weightGoal) =>
              o.update({
                weightGoal,
                metrics: {
                  ...p.metrics,
                  goalWeightKg: undefined,
                },
              })
            }
          />
          <Text style={s.body}>
            We’ll use this to organise check-ins and relevant reading. You do
            not need a target weight, and Forma does not promise a particular
            rate of change.
          </Text>
        </>
      ) : null}
      {o.current === 'metrics' ? (
        <PersonalMetricsStep
          profile={p}
          onNext={(next) => void o.next(next)}
          onUpdate={o.update}
          disabled={o.pending}
        />
      ) : null}
      {o.current === 'activity' ? (
        <ActivityStep
          profile={p}
          onNext={(next) => void o.next(next)}
          onUpdate={o.update}
          disabled={o.pending}
        />
      ) : null}
      {o.current === 'learning' ? (
        <>
          <SelectionGroup
            multiple
            label="Topics you’re curious about"
            value={p.learning.topics}
            options={topicOptions}
            onChange={(topic) =>
              o.update({
                learning: {
                  ...p.learning,
                  topics: p.learning.topics.includes(topic)
                    ? p.learning.topics.filter((t) => t !== topic)
                    : [...p.learning.topics, topic],
                },
              })
            }
          />
          <SelectionGroup
            label="How much explanation would you like?"
            value={p.learning.guidance}
            options={[
              {
                value: 'more',
                label: 'Start from the beginning',
                detail: 'Explain unfamiliar terms and use simple examples.',
              },
              {
                value: 'balanced',
                label: 'A clear overview',
                detail: 'Cover the essentials without every detail.',
              },
              {
                value: 'less',
                label: 'Keep it concise',
                detail: 'Let me choose the topics I need.',
              },
            ]}
            onChange={(guidance) =>
              o.update({ learning: { ...p.learning, guidance } })
            }
          />
          <Text style={s.small}>
            If you’re unsure, leave the topics blank. We’ll start with
            fundamentals.
          </Text>
        </>
      ) : null}
      {o.current === 'community' ? (
        <>
          <Text style={s.body}>
            Partner matching is a future feature. For now, save your preferences
            and explore how training with others might fit your routine. No
            location permissions are requested.
          </Text>
          <SelectionGroup
            label="Who would you enjoy training with?"
            value={p.community.style ?? 'undecided'}
            options={[
              { value: 'partner', label: 'One training buddy' },
              { value: 'group', label: 'A small group' },
              { value: 'solo', label: 'I usually prefer training alone' },
              { value: 'undecided', label: 'I’m not sure yet' },
            ]}
            onChange={(style) =>
              o.update({ community: { ...p.community, style } })
            }
          />
          <SelectionGroup
            label="Where do you like to train?"
            value={p.community.setting ?? 'any'}
            options={[
              { value: 'gym', label: 'At a gym' },
              { value: 'home', label: 'At home' },
              { value: 'outdoors', label: 'Outdoors' },
              { value: 'any', label: 'No preference yet' },
            ]}
            onChange={(setting) =>
              o.update({ community: { ...p.community, setting } })
            }
          />
        </>
      ) : null}
      {o.current === 'training-goal' ? (
        <SelectionGroup
          label="Training goal"
          value={training.goal}
          options={(
            Object.keys(goalLabels) as TrainingPreferences['goal'][]
          ).map((value) => ({ value, label: goalLabels[value] }))}
          onChange={(goal) => o.training({ goal })}
        />
      ) : null}
      {o.current === 'schedule' ? (
        <ScheduleStep
          preferences={training}
          onDays={(days) => o.training({ days })}
          onDuration={(duration) => o.training({ duration })}
        />
      ) : null}
      {o.current === 'equipment' ? (
        <EquipmentStep
          preferences={training}
          onKnowledge={(equipmentKnowledge) =>
            o.training({
              equipmentKnowledge,
              equipment:
                equipmentKnowledge === 'unsure'
                  ? ['Bodyweight']
                  : training.equipment,
            })
          }
          onEquipment={(equipment) => o.training({ equipment })}
        />
      ) : null}
      {o.current === 'review' ? (
        <>
          <Card>
            <Text style={s.sectionTitle}>Your interests</Text>
            <Text style={s.body}>
              {p.interests
                .map((value) => interests.find((i) => i.value === value)?.label)
                .join(' · ')}
            </Text>
            <Text style={s.small}>
              Your choices personalise Home. Learning, routines, exercises and
              tracking remain available whenever you need them.
            </Text>
            {p.weightGoal ? (
              <Text style={s.body}>
                Weight goal:{' '}
                {p.weightGoal === 'lose'
                  ? 'Lose weight'
                  : p.weightGoal === 'gain'
                    ? 'Gain weight'
                    : 'Maintain weight'}
                {p.metrics.goalWeightKg !== undefined
                  ? ` · ${formatWeight(p.metrics.goalWeightKg, p.units)}`
                  : ''}
              </Text>
            ) : null}
          </Card>
          {trainingRelevant ? (
            <>
              <Text style={s.sectionTitle}>A training plan is optional</Text>
              <Text style={s.body}>
                Save your preferences and explore, or review a starting plan.
                Accepting a plan adds routines alongside your existing ones.
              </Text>
              {draft ? (
                <PlanReview
                  plan={draft}
                  preferences={training}
                  onUpdate={o.updateRoutine}
                />
              ) : (
                <Button
                  secondary
                  label="Review an optional training plan"
                  onPress={o.recommend}
                />
              )}
            </>
          ) : null}
          {o.error ? (
            <Text accessibilityRole="alert" style={s.error}>
              {o.error}
            </Text>
          ) : null}
          {trainingRelevant && draft ? (
            <Button
              label="Accept plan & open Home"
              disabled={o.pending}
              onPress={() => void o.finish(true)}
            />
          ) : null}
          <Button
            label={
              o.pending
                ? 'Saving…'
                : draft
                  ? 'Finish without adding a plan'
                  : 'Finish & open Home'
            }
            secondary={!!draft}
            disabled={o.pending}
            onPress={() => void o.finish()}
          />
        </>
      ) : null}
      {o.current !== 'review' &&
      o.current !== 'metrics' &&
      o.current !== 'activity' ? (
        <>
          {o.error ? (
            <Text accessibilityRole="alert" style={s.error}>
              {o.error}
            </Text>
          ) : null}
          <Button
            label="Continue"
            disabled={o.pending}
            onPress={() => void o.next()}
          />
          {o.current === 'community' || o.current === 'learning' ? (
            <Button
              secondary
              label="Skip this step"
              disabled={o.pending}
              onPress={() => void o.next()}
            />
          ) : null}
        </>
      ) : null}
      {(o.current === 'metrics' || o.current === 'activity') && o.error ? (
        <Text accessibilityRole="alert" style={s.error}>
          {o.error}
        </Text>
      ) : null}
      {index > 0 ? (
        <Button
          secondary
          label="Back"
          disabled={o.pending}
          onPress={() => void o.back()}
        />
      ) : null}
      <Text style={s.small}>
        {o.error
          ? 'Your existing routines and history are kept.'
          : o.savingDraft
            ? 'Saving answers…'
            : o.pending
              ? 'Saving…'
              : 'Choices are saved on this device. Measurements save when you continue.'}
      </Text>
    </Screen>
  );
}
