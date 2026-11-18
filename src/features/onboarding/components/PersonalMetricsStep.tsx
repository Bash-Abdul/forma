import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Field, useUiStyles } from '@/components/ui';
import { SelectionGroup } from '@/components/ui/SelectionGroup';
import { FitnessProfile } from '@/types';
import {
  toCm,
  toKg,
  toDisplayHeight,
  toDisplayWeight,
  weightUnit,
} from '@/features/profile/services/measurements';
import { validateFitnessStep } from '@/features/profile/services/fitnessProfile';
type Props = {
  profile: FitnessProfile;
  onNext: (profile: FitnessProfile) => void;
  onUpdate: (patch: Partial<FitnessProfile>) => void;
  disabled: boolean;
};
function text(value: number | undefined): string {
  return value === undefined ? '' : String(Number(value.toFixed(1)));
}
export function PersonalMetricsStep({
  profile: p,
  onNext,
  onUpdate,
  disabled,
}: Props) {
  const s = useUiStyles();

  const [values, setValues] = useState({
    age: text(p.metrics.age),
    height: text(
      p.metrics.heightCm === undefined
        ? undefined
        : toDisplayHeight(p.metrics.heightCm, p.units),
    ),
    weight: text(
      p.metrics.weightKg === undefined
        ? undefined
        : toDisplayWeight(p.metrics.weightKg, p.units),
    ),
    goal: text(
      p.metrics.goalWeightKg === undefined
        ? undefined
        : toDisplayWeight(p.metrics.goalWeightKg, p.units),
    ),
  });
  const [error, setError] = useState('');
  function parsed(): FitnessProfile['metrics'] {
    const n = (v: string) =>
      v.trim() === '' ? undefined : Number(v.replace(',', '.'));
    const height = n(values.height),
      weight = n(values.weight),
      goal = n(values.goal);
    return {
      age: n(values.age),
      heightCm: height === undefined ? undefined : toCm(height, p.units),
      weightKg: weight === undefined ? undefined : toKg(weight, p.units),
      goalWeightKg:
        p.weightGoal === 'maintain'
          ? undefined
          : goal === undefined
            ? undefined
            : toKg(goal, p.units),
    };
  }
  function submit(): void {
    const next = { ...p, metrics: parsed() };
    const invalid = validateFitnessStep(next, 'metrics');
    if (invalid) {
      setError(invalid);
      return;
    }
    onNext(next);
  }
  return (
    <>
      <Text style={s.body}>
        These details are optional. They help you describe your starting point
        and display your progress in the units you prefer. We do not calculate
        calorie targets or require measurements to use Forma. They stay on this
        device.
      </Text>
      <SelectionGroup
        label="Measurement units"
        value={p.units}
        options={[
          { value: 'metric', label: 'Metric · kg and cm' },
          { value: 'imperial', label: 'Imperial · lb and inches' },
        ]}
        onChange={(units) => {
          const metrics = parsed();
          const invalid = validateFitnessStep({ ...p, metrics }, 'metrics');
          if (invalid) {
            setError('Check the values before changing units, or clear them.');
            return;
          }
          onUpdate({ units, metrics });
          setValues({
            age: text(metrics.age),
            height: text(
              metrics.heightCm === undefined
                ? undefined
                : toDisplayHeight(metrics.heightCm, units),
            ),
            weight: text(
              metrics.weightKg === undefined
                ? undefined
                : toDisplayWeight(metrics.weightKg, units),
            ),
            goal: text(
              metrics.goalWeightKg === undefined
                ? undefined
                : toDisplayWeight(metrics.goalWeightKg, units),
            ),
          });
          setError('');
        }}
      />
      <Field
        label="Age (optional)"
        value={values.age}
        placeholder="Years, 18 or over"
        keyboardType="number-pad"
        onChangeText={(age) => setValues((v) => ({ ...v, age }))}
      />
      <Field
        label={`Height (${p.units === 'metric' ? 'cm' : 'inches'}, optional)`}
        value={values.height}
        placeholder={p.units === 'metric' ? 'e.g. 170' : 'e.g. 67'}
        keyboardType="decimal-pad"
        onChangeText={(height) => setValues((v) => ({ ...v, height }))}
      />
      <Field
        label={`Current weight (${weightUnit(p.units)}, optional)`}
        value={values.weight}
        keyboardType="decimal-pad"
        onChangeText={(weight) => setValues((v) => ({ ...v, weight }))}
      />
      {p.weightGoal && p.weightGoal !== 'maintain' ? (
        <Field
          label={`Goal weight (${weightUnit(p.units)}, optional)`}
          value={values.goal}
          keyboardType="decimal-pad"
          onChangeText={(goal) => setValues((v) => ({ ...v, goal }))}
        />
      ) : null}
      <Text style={s.small}>
        Measurements are saved when you continue. You can leave every field
        blank.
      </Text>
      {error ? (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      ) : null}
      <View style={{ gap: 10 }}>
        <Button label="Continue" disabled={disabled} onPress={submit} />
        <Button
          label="Skip measurements"
          secondary
          disabled={disabled}
          onPress={() => onNext(p)}
        />
      </View>
    </>
  );
}
