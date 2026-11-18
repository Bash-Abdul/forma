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
  version: 2;
  appearance?: 'system' | 'light' | 'dark';
  fitnessProfile: FitnessProfile;
  demoRecords?: {
    workoutIds: string[];
    weightIds: string[];
    routineIds?: string[];
  };
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

export type FitnessInterest =
  | 'learn'
  | 'weight'
  | 'training'
  | 'progress'
  | 'nutrition'
  | 'community'
  | 'explore';
export type LearningTopic =
  'fundamentals' | 'strength' | 'consistency' | 'weight' | 'nutrition';
export type FitnessGoal =
  | 'learn-fundamentals'
  | 'lose-weight'
  | 'gain-weight'
  | 'maintain-weight'
  | 'build-strength'
  | 'build-muscle'
  | 'improve-fitness'
  | 'track-progress'
  | 'understand-nutrition'
  | 'find-partners'
  | 'explore';
export type FitnessStep =
  | 'interests'
  | 'experience'
  | 'eligibility'
  | 'weight-goal'
  | 'metrics'
  | 'activity'
  | 'learning'
  | 'community'
  | 'training-goal'
  | 'schedule'
  | 'equipment'
  | 'review';
export type FitnessProfile = {
  version: 1;
  interests: FitnessInterest[];
  goals: FitnessGoal[];
  experience: TrainingPreferences['experience'];
  guidance: TrainingPreferences['guidance'];
  eligibility?: 'adult' | 'under18' | 'unspecified';
  units: 'metric' | 'imperial';
  weightGoal?: 'lose' | 'gain' | 'maintain';
  metrics: {
    age?: number;
    heightCm?: number;
    weightKg?: number;
    goalWeightKg?: number;
  };
  activity: {
    level?: 'sedentary' | 'light' | 'moderate' | 'active';
    steps?: number;
  };
  weightSupport: { nutrition: boolean; activity: boolean };
  learning: { topics: LearningTopic[]; guidance: 'more' | 'balanced' | 'less' };
  community: {
    style?: 'partner' | 'group' | 'solo' | 'undecided';
    setting?: 'gym' | 'home' | 'outdoors' | 'any';
  };
  training?: TrainingPreferences;
  onboarding: {
    status: 'not-started' | 'in-progress' | 'complete' | 'skipped';
    step: FitnessStep;
    updatedAt?: string;
    planDraft?: {
      id: string;
      title: string;
      explanation: string[];
      routines: Routine[];
    };
  };
};
