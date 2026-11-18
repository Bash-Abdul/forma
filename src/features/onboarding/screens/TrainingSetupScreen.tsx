import { useTheme } from '@/theme/provider';
import { Pressable, Text, View } from 'react-native';
import { Button, Heading, Screen, useUiStyles } from '@/components/ui';
import { SelectionGroup } from '@/components/ui/SelectionGroup';

import { TrainingPreferences } from '@/types';
import { useOnboarding } from '../hooks/useOnboarding';
import { PlanReview } from '../components/PlanReview';
import { ScheduleStep } from '../components/ScheduleStep';
import { EquipmentStep } from '../components/EquipmentStep';
import {
  experienceLabels,
  goalLabels,
  guidanceDescriptions,
  guidanceLabels,
} from '../services/preferences';
const titles = [
  'What brings you here?',
  'Make room for training.',
  'What can you train with?',
  'How should Forma help?',
];
const details = [
  'Choose your main goal and current experience.',
  'Choose a week you can repeat, with time to recover.',
  'Select all available equipment. Bodyweight movements are always included.',
  'You stay in control. Every generated plan is reviewed before it is saved.',
];
export default function OnboardingScreen() {
  const s = useUiStyles();
  const { colors: c } = useTheme();

  const o = useOnboarding();
  const p = o.values;
  return (
    <Screen scrollKey={o.plan ? 'review' : o.step}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={s.link}>
          {o.plan ? 'REVIEW YOUR PLAN' : `GETTING STARTED · ${o.step + 1} / 4`}
        </Text>
        <Pressable
          disabled={o.pending}
          accessibilityRole="button"
          onPress={() => void o.skip()}
          style={{ paddingVertical: 12, paddingLeft: 12 }}
        >
          <Text style={s.link}>{o.configured ? 'Cancel' : 'Skip for now'}</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 3,
              backgroundColor: i <= o.step ? c.primary : c.line,
            }}
          />
        ))}
      </View>
      <Heading
        title={o.plan ? 'Your starting plan' : titles[o.step]}
        detail={
          o.plan
            ? 'Review the recommendation and make it your own.'
            : p.experience === 'beginner' && o.step === 1
              ? 'Choose how often you can train and how long you can spend on one workout.'
              : p.experience === 'beginner' && o.step === 2
                ? 'Not familiar with equipment? We’ll help you choose a starting point.'
                : details[o.step]
        }
      />
      {o.plan ? (
        <PlanReview plan={o.plan} preferences={p} onUpdate={o.updateRoutine} />
      ) : (
        <>
          {o.step === 0 ? (
            <>
              <SelectionGroup
                label="Main goal"
                value={p.goal}
                options={(
                  Object.keys(goalLabels) as TrainingPreferences['goal'][]
                ).map((value) => ({ value, label: goalLabels[value] }))}
                onChange={(v) => o.setPreference('goal', v)}
              />
              <SelectionGroup
                label="Training experience"
                value={p.experience}
                options={(
                  Object.keys(
                    experienceLabels,
                  ) as TrainingPreferences['experience'][]
                ).map((value) => ({
                  value,
                  label: experienceLabels[value],
                  detail:
                    value === 'beginner'
                      ? 'New to structured training or returning after a long break.'
                      : value === 'intermediate'
                        ? 'Comfortable with the basics and training regularly.'
                        : 'Several years of consistent, structured training.',
                }))}
                onChange={(v) => o.setPreference('experience', v)}
              />
            </>
          ) : null}
          {o.step === 1 ? (
            <ScheduleStep
              preferences={p}
              onDays={(v) => o.setPreference('days', v)}
              onDuration={(v) => o.setPreference('duration', v)}
            />
          ) : null}
          {o.step === 2 ? (
            <EquipmentStep
              preferences={p}
              onKnowledge={(v) => {
                o.setPreference('equipmentKnowledge', v);
                if (v === 'unsure')
                  o.setPreference('equipment', ['Bodyweight']);
              }}
              onEquipment={(v) => o.setPreference('equipment', v)}
              error={o.equipmentError}
            />
          ) : null}
          {o.step === 3 ? (
            <SelectionGroup
              label="Guidance level"
              value={p.guidance}
              options={(
                Object.keys(guidanceLabels) as TrainingPreferences['guidance'][]
              ).map((value) => ({
                value,
                label: guidanceLabels[value],
                detail: guidanceDescriptions[value],
              }))}
              onChange={(v) => o.setPreference('guidance', v)}
            />
          ) : null}
        </>
      )}
      {o.error ? (
        <Text accessibilityRole="alert" style={s.error}>
          {o.error}
        </Text>
      ) : null}
      {o.plan ? (
        <>
          <Button
            label={o.pending ? 'Saving…' : 'Accept & add routines'}
            disabled={o.pending}
            onPress={() => void o.accept()}
          />
          <Button
            secondary
            label="Back to preferences"
            disabled={o.pending}
            onPress={o.backToPreferences}
          />
        </>
      ) : o.step < 3 ? (
        <Button
          label="Continue"
          disabled={o.pending}
          onPress={() => void o.next()}
        />
      ) : (
        <>
          <Button
            secondary={p.guidance === 'independent'}
            label={
              p.guidance === 'independent'
                ? 'Generate an optional starting plan'
                : 'Review recommended plan'
            }
            disabled={o.pending}
            onPress={() => void o.generate()}
          />
          <Button
            secondary={p.guidance !== 'independent'}
            label={o.pending ? 'Saving…' : 'Save preferences only'}
            disabled={o.pending}
            onPress={() => void o.saveOnly()}
          />
          <Text style={s.small}>
            Saving preferences leaves every existing routine and workout
            unchanged.
          </Text>
        </>
      )}
      {!o.plan && o.step > 0 ? (
        <Button
          secondary
          label="Previous step"
          disabled={o.pending}
          onPress={() => o.setStep(o.step - 1)}
        />
      ) : null}
    </Screen>
  );
}
