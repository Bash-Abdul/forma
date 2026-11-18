import { Text } from 'react-native';
import { Button, Card, useUiStyles } from '@/components/ui';
import { SelectionGroup } from '@/components/ui/SelectionGroup';
import { TrainingPreferences } from '@/types';
type Props = {
  preferences: TrainingPreferences;
  onDays: (days: TrainingPreferences['days']) => void;
  onDuration: (duration: TrainingPreferences['duration']) => void;
};
export function ScheduleStep({ preferences: p, onDays, onDuration }: Props) {
  const s = useUiStyles();

  const beginner = p.experience === 'beginner';
  return (
    <>
      {beginner ? (
        <>
          <Text style={s.body}>
            Training days means how many days you can give to a workout each
            week. For example, 2 days could be Monday and Thursday. You do not
            need to train every day.
          </Text>
          <Card>
            <Text style={s.sectionTitle}>A starting point, if you’re new</Text>
            <Text style={s.body}>
              For this demo, we suggest 2–3 days a week and around 45 minutes
              per workout, leaving time to learn the movements and take breaks.
              Choose 60 minutes if you want more time, or 30 if that fits your
              day better.
            </Text>
            <Button
              secondary
              label="Use 3 days and 45 minutes"
              onPress={() => {
                onDays(3);
                onDuration(45);
              }}
            />
          </Card>
        </>
      ) : null}
      <SelectionGroup
        label="Training days per week"
        value={p.days}
        options={([2, 3, 4, 5] as const).map((value) => ({
          value,
          label: `${value} days`,
          detail: beginner
            ? value === 2
              ? 'Two workouts each week, with days off in between.'
              : value === 3
                ? 'Three workouts each week — a practical starting option.'
                : value === 4
                  ? 'Four workouts each week. Choose this if you can set aside the time.'
                  : 'Five workouts each week. A bigger commitment; starting with fewer is fine.'
            : undefined,
        }))}
        onChange={onDays}
      />
      {beginner ? (
        <Text style={s.body}>
          Session duration is how long one workout takes on a training day,
          including a warm-up, exercises and rest breaks. It is not a daily
          target for the days you are not training.
        </Text>
      ) : null}
      <SelectionGroup
        label="Preferred session duration"
        value={p.duration}
        options={([30, 45, 60] as const).map((value) => ({
          value,
          label: `${value} minutes`,
          detail: beginner
            ? value === 30
              ? 'A shorter workout when you have less time.'
              : value === 45
                ? 'Our demo starting point: time to practise and take breaks.'
                : 'Extra time to practise at your own pace. Longer is not automatically better.'
            : undefined,
        }))}
        onChange={onDuration}
      />
    </>
  );
}
