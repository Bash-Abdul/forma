export type Exercise = {
  id: string;
  name: string;
  muscle: string;
  secondary: string[];
  equipment: string;
  category: string;
  instructions: string;
};
export type PlannedExercise = {
  exerciseId: string;
  sets: number;
  minReps: number;
  maxReps: number;
};
export type Routine = {
  id: string;
  name: string;
  subtitle: string;
  day: number;
  exercises: PlannedExercise[];
};
export type LoggedSet = {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
};
export type WorkoutExercise = {
  exerciseId: string;
  minReps: number;
  maxReps: number;
  sets: LoggedSet[];
};
export type Workout = {
  id: string;
  routineId: string;
  name: string;
  startedAt: string;
  finishedAt?: string;
  exercises: WorkoutExercise[];
};
export type WeightEntry = { id: string; date: string; kg: number };
export type AppData = {
  version: 1;
  onboarding?: Onboarding;
  routines: Routine[];
  workouts: Workout[];
  weights: WeightEntry[];
  active: Workout | null;
};

export type TrainingPreferences = {
  goal: 'strength' | 'muscle' | 'fitness' | 'weight-loss';
  experience: 'beginner' | 'intermediate' | 'advanced';
  days: 2 | 3 | 4 | 5;
  duration: 30 | 45 | 60;
  equipment: ('Bodyweight' | 'Dumbbell' | 'Barbell' | 'Cable' | 'Machine')[];
  equipmentKnowledge?: 'known' | 'unsure';
  guidance: 'guided' | 'flexible' | 'independent';
};
export type Onboarding = {
  status: 'pending' | 'skipped' | 'complete';
  preferences?: TrainingPreferences;
  acceptedPlan?: {
    id: string;
    title: string;
    routineIds: string[];
    days: number;
    acceptedAt: string;
  };
};
