import { useState } from 'react';
import { Text } from 'react-native';
import { Button, Field, useUiStyles } from '@/components/ui';
import { SelectionGroup } from '@/components/ui/SelectionGroup';
import { FitnessProfile } from '@/types';
import { validateFitnessStep } from '@/features/profile/services/fitnessProfile';
export function ActivityStep({
  profile: p,
  onNext,
  onUpdate,
  disabled,
}: {
  profile: FitnessProfile;
  onNext: (p: FitnessProfile) => void;
  onUpdate: (p: Partial<FitnessProfile>) => void;
  disabled: boolean;
}) {
  const s = useUiStyles();

  const [steps, setSteps] = useState(
    p.activity.steps === undefined ? '' : String(p.activity.steps),
  );
  const [error, setError] = useState('');
  return (
    <>
      <Text style={s.body}>
        This is a rough description of a usual day, not a step target or an
        activity record. Leave it blank if you are unsure.
      </Text>
      <SelectionGroup
        label="A typical day"
        value={p.activity.level ?? 'unknown'}
        options={[
          { value: 'unknown', label: 'I’m not sure' },
          {
            value: 'sedentary',
            label: 'Mostly sitting',
            detail: 'Most work or study is seated, with little walking.',
          },
          {
            value: 'light',
            label: 'Some movement',
            detail: 'A mix of sitting and occasional walking.',
          },
          {
            value: 'moderate',
            label: 'Often on my feet',
            detail: 'Regular walking or a job with plenty of movement.',
          },
          {
            value: 'active',
            label: 'Very active',
            detail: 'A physically demanding day or lots of movement.',
          },
        ]}
        onChange={(v) =>
          onUpdate({
            activity: { ...p.activity, level: v === 'unknown' ? undefined : v },
          })
        }
      />
      <Field
        label="Approximate steps per day (optional)"
        placeholder="e.g. 5000, or leave blank"
        value={steps}
        keyboardType="number-pad"
        onChangeText={setSteps}
      />
      <SelectionGroup
        multiple
        label="What would you like help understanding?"
        value={[
          ...(p.weightSupport.nutrition ? ['nutrition'] : []),
          ...(p.weightSupport.activity ? ['activity'] : []),
        ]}
        options={[
          { value: 'nutrition', label: 'Food and nutrition basics' },
          { value: 'activity', label: 'Ways to move more' },
        ]}
        onChange={(v) =>
          onUpdate({
            weightSupport: {
              ...p.weightSupport,
              [v]: !p.weightSupport[v as 'nutrition' | 'activity'],
            },
          })
        }
      />
      {error ? (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      ) : null}
      <Button
        label="Continue"
        disabled={disabled}
        onPress={() => {
          const next = {
            ...p,
            activity: {
              ...p.activity,
              steps: steps.trim() === '' ? undefined : Number(steps),
            },
          };
          const invalid = validateFitnessStep(next, 'activity');
          if (invalid) {
            setError(invalid);
            return;
          }
          onNext(next);
        }}
      />
      <Button
        secondary
        label="Skip activity baseline"
        disabled={disabled}
        onPress={() => onNext(p)}
      />
    </>
  );
}
