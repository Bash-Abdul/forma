import { Text } from 'react-native';
import { Card, s } from '@/components/ui';
import { SelectionGroup } from '@/components/ui/SelectionGroup';
import { TrainingPreferences } from '@/types';
type Props = {
  preferences: TrainingPreferences;
  onKnowledge: (value: 'known' | 'unsure') => void;
  onEquipment: (equipment: TrainingPreferences['equipment']) => void;
  error?: string;
};
const equipmentOptions = [
  {
    value: 'Bodyweight',
    label: 'Bodyweight / no equipment',
    detail:
      'Use your own body for resistance, such as a squat or a push-up. No weights needed.',
  },
  {
    value: 'Dumbbell',
    label: 'Dumbbells',
    detail: 'Short handheld weights, usually held one in each hand.',
  },
  {
    value: 'Barbell',
    label: 'Barbell, bench & rack',
    detail:
      'A long bar with weight plates. These routines also need a bench and a rack to support the bar.',
  },
  {
    value: 'Cable',
    label: 'Cable station',
    detail:
      'A gym machine where you pull handles attached to cables and a stack of weights.',
  },
  {
    value: 'Machine',
    label: 'Gym machines',
    detail:
      'Equipment that guides a movement, such as a leg press or leg curl.',
  },
] as const;
export function EquipmentStep({
  preferences: p,
  onKnowledge,
  onEquipment,
  error,
}: Props) {
  const beginner = p.experience === 'beginner';
  const unsure = p.equipmentKnowledge === 'unsure';
  return (
    <>
      {beginner ? (
        <Text style={s.body}>
          Equipment means the weights or machines you can use where you will
          train. You do not need to know their names to get started.
        </Text>
      ) : null}
      <SelectionGroup
        label={
          beginner
            ? 'Do you know what equipment you have?'
            : 'Equipment selection'
        }
        value={unsure ? 'unsure' : 'known'}
        options={[
          {
            value: 'unsure',
            label: 'I’m not sure yet',
            detail: beginner
              ? 'I don’t recognise the equipment, or haven’t decided where to train.'
              : undefined,
          },
          {
            value: 'known',
            label: 'I can choose my equipment',
            detail: beginner
              ? 'Show me the options with a short explanation of each.'
              : undefined,
          },
        ]}
        onChange={onKnowledge}
      />
      {unsure ? (
        <Card>
          <Text style={s.sectionTitle}>
            You can start without knowing the names
          </Text>
          <Text style={s.body}>
            We’ll make an equipment-free starter plan using your own bodyweight.
            We won’t guess what gym equipment you have.
          </Text>
          <Text style={s.small}>
            You can learn the movements in the exercise library and update your
            equipment later in Profile. If you plan to use a gym, ask its staff
            to show you what is available.
          </Text>
        </Card>
      ) : (
        <SelectionGroup
          multiple
          label="Available equipment"
          value={p.equipment}
          options={equipmentOptions.map((option) => ({
            ...option,
            detail: beginner ? option.detail : undefined,
          }))}
          onChange={(v) =>
            onEquipment(
              p.equipment.includes(v)
                ? p.equipment.filter((e) => e !== v)
                : [...p.equipment, v],
            )
          }
        />
      )}
      {error ? (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      ) : null}
    </>
  );
}
