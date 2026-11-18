import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Back, Button, Heading, Screen, useUiStyles } from '@/components/ui';
import { SelectionGroup } from '@/components/ui/SelectionGroup';
import { useData, useSave } from '@/lib/store';
import TrainingSetupScreen from './TrainingSetupScreen';
export default function TrainingSetupGate() {
  const s = useUiStyles();

  const { data } = useData();
  const save = useSave();
  const [answer, setAnswer] = useState<
    'adult' | 'under18' | 'unspecified' | undefined
  >(data?.fitnessProfile.eligibility);
  if (!data) return null;
  if (data.fitnessProfile.eligibility === 'adult')
    return <TrainingSetupScreen />;
  return (
    <Screen>
      <Back />
      <Heading
        title="Before we suggest a plan"
        detail="Personalised starter plans in this demo are for adults aged 18 and over. This is a product scope choice, not a requirement for exploring Forma."
      />
      <SelectionGroup
        label="Are you 18 or older?"
        value={answer}
        options={[
          { value: 'adult', label: 'Yes, I’m 18 or older' },
          { value: 'under18', label: 'I’m under 18' },
          { value: 'unspecified', label: 'I’d rather not say' },
        ]}
        onChange={setAnswer}
      />
      {answer === 'adult' ? (
        <Button
          label="Continue to training setup"
          disabled={save.isPending}
          onPress={() =>
            save.mutate((d) => ({
              ...d,
              fitnessProfile: { ...d.fitnessProfile, eligibility: 'adult' },
            }))
          }
        />
      ) : (
        <>
          <Text style={s.body}>
            You can still explore learning, routines, exercise instructions and
            your records. For personalised training advice as a young person,
            speak with a qualified professional who works with your age group.
          </Text>
          <Button
            label="Explore routines"
            onPress={() => router.replace('/routines')}
          />
        </>
      )}
      {save.isError ? (
        <Text style={s.error}>Couldn’t save. Try again.</Text>
      ) : null}
    </Screen>
  );
}
