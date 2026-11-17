import { Exercise, Routine, TrainingPreferences } from '@/types';
import { exercises, exerciseById } from '@/mocks/exercises';
import {
  preferencesSchema,
  goalLabels,
  experienceLabels,
  guidanceDescriptions,
} from './preferences';
export type GeneratedPlan = {
  title: string;
  explanation: string[];
  routines: Routine[];
};
type Slot =
  | 'squat'
  | 'hinge'
  | 'push'
  | 'pull'
  | 'overhead'
  | 'verticalPull'
  | 'lunge'
  | 'calf'
  | 'core'
  | 'curl'
  | 'triceps'
  | 'lateral'
  | 'legcurl';
const options: Record<Slot, string[]> = {
  squat: ['squat', 'goblet', 'legpress', 'bwsquat'],
  hinge: ['rdl', 'dbrdl', 'hip', 'bridge'],
  push: ['bench', 'floorpress', 'pushup'],
  pull: ['row', 'dbrow', 'bbrow', 'pronew'],
  overhead: ['shoulder', 'lateral', 'snowangel'],
  verticalPull: ['pulldown', 'dbrow', 'snowangel'],
  lunge: ['lunge', 'bwlunge'],
  calf: ['calf', 'bwcalf'],
  core: ['plank'],
  curl: ['curl', 'snowangel'],
  triceps: ['pushdown', 'pushup'],
  lateral: ['lateral', 'pronew'],
  legcurl: ['legcurl', 'bridge'],
};
const templates: Record<string, Slot[]> = {
  full: ['squat', 'push', 'pull', 'hinge', 'core', 'lunge'],
  upper: ['push', 'pull', 'overhead', 'verticalPull', 'curl', 'lateral'],
  lower: ['squat', 'hinge', 'lunge', 'calf', 'core', 'legcurl'],
  push: ['push', 'overhead', 'lateral', 'triceps', 'core'],
  pull: ['pull', 'verticalPull', 'curl', 'overhead', 'core'],
  legs: ['squat', 'hinge', 'lunge', 'calf', 'legcurl', 'core'],
};
/** Pure, deterministic rules: no IDs, dates or random choices are generated here. */
export function generatePlan(input: TrainingPreferences): GeneratedPlan {
  const p = preferencesSchema.parse(input);
  const generalGoal = p.goal === 'fitness' || p.goal === 'weight-loss';
  let split: string;
  let sessions: string[];
  if (
    p.days === 2 ||
    (p.days === 3 && (p.experience === 'beginner' || generalGoal))
  ) {
    split = 'Full body';
    sessions = Array.from({ length: p.days }, () => 'full');
  } else if (p.days === 3) {
    split = 'Upper / lower / full body';
    sessions = ['upper', 'lower', 'full'];
  } else if (p.days === 4) {
    split = 'Upper / lower';
    sessions = ['upper', 'lower', 'upper', 'lower'];
  } else if (p.experience === 'beginner') {
    split = 'Upper / lower + technique';
    sessions = ['upper', 'lower', 'upper', 'lower', 'full'];
  } else {
    split = 'Upper / lower / push / pull / legs';
    sessions = ['upper', 'lower', 'push', 'pull', 'legs'];
  }
  const schedule: Record<number, number[]> = {
    2: [1, 4],
    3: [1, 3, 5],
    4: [1, 2, 4, 5],
    5: [1, 2, 4, 5, 6],
  };
  const count = p.duration === 30 ? 4 : p.duration === 45 ? 5 : 6;
  const allowed = new Set<string>([...p.equipment, 'Bodyweight']);
  const occurrences: Record<string, number> = {};
  const routines = sessions.map((type, index): Routine => {
    occurrences[type] = (occurrences[type] ?? 0) + 1;
    const technique =
      p.days === 5 && p.experience === 'beginner' && index === 4;
    const name = technique
      ? 'Full body technique'
      : `${type === 'full' ? 'Full body' : type === 'upper' ? 'Upper body' : type === 'lower' ? 'Lower body' : type[0].toUpperCase() + type.slice(1)} ${String.fromCharCode(64 + occurrences[type])}`;
    const used = new Set<string>();
    const selected = templates[type]
      .flatMap((slot) => {
        let candidates = options[slot];
        // Beginners start with simpler supported or dumbbell movements when available.
        if (p.experience === 'beginner')
          candidates = [...candidates].sort((a, b) => {
            const rank: Record<string, number> = {
              Machine: 0,
              Cable: 0,
              Dumbbell: 1,
              Barbell: 2,
              Bodyweight: 3,
            };
            return (
              rank[exerciseById(a).equipment] - rank[exerciseById(b).equipment]
            );
          });
        const id = candidates.find(
          (id) => allowed.has(exerciseById(id).equipment) && !used.has(id),
        );
        if (!id) return [];
        used.add(id);
        return [id];
      })
      .slice(0, technique ? 3 : count);
    const sets =
      technique || p.experience === 'beginner' || p.duration === 30
        ? 2
        : p.experience === 'advanced' && p.duration === 60
          ? 4
          : 3;
    return {
      id: `draft-${index + 1}`,
      name,
      day: schedule[p.days][index],
      subtitle: technique
        ? 'Light practice · use an easy effort'
        : `${split} · ${goalLabels[p.goal].toLowerCase()}`,
      exercises: selected.map((id) => {
        const e = exerciseById(id);
        const strength =
          p.goal === 'strength' &&
          p.experience !== 'beginner' &&
          e.category === 'Compound' &&
          e.equipment !== 'Bodyweight';
        return {
          exerciseId: id,
          sets,
          minReps: id === 'plank' ? 20 : strength ? 5 : generalGoal ? 10 : 8,
          maxReps: id === 'plank' ? 40 : strength ? 8 : generalGoal ? 15 : 12,
        };
      }),
    };
  });
  const why =
    p.days <= 3
      ? `With ${p.days} days, each major muscle group gets regular practice without needing a separate day for every body part.`
      : `With ${p.days} days, spreading upper and lower work across the week keeps each session focused.`;
  const limited = !p.equipment.some((e) =>
    ['Dumbbell', 'Cable', 'Barbell'].includes(e),
  );
  return {
    title: `${p.days}-day ${split.toLowerCase()}`,
    routines,
    explanation: [
      ...(p.experience === 'beginner'
        ? [
            'How to read your plan: a rep is one complete movement. A set is a group of reps, followed by a rest. For example, 2 sets of 8–12 means do the movement 8–12 times, rest, then repeat. A training split is simply how the workouts are organised across your week.',
          ]
        : []),
      why,
      ...(p.goal === 'weight-loss'
        ? [
            'Your lose-weight goal uses repeatable strength sessions across the whole body. The focus is building a consistent training habit; this plan does not predict a change on the scale.',
          ]
        : []),
      ...(p.equipmentKnowledge === 'unsure'
        ? [
            'You are not sure about equipment yet, so this starter plan uses only your own bodyweight. Update equipment in Profile when you are ready; no gym equipment has been assumed.',
          ]
        : []),
      `${experienceLabels[p.experience]} starting volume: ${routines[0].exercises[0].sets} sets per movement. ${p.goal === 'strength' && p.experience !== 'beginner' ? 'Loaded compound movements use 5–8 reps for a strength focus.' : generalGoal ? 'Most movements use 10–15 reps for a repeatable whole-body training foundation.' : 'Most movements use 8–12 reps to build a foundation of strength and muscle.'}`,
      `${p.duration}-minute preference: up to ${count} movements per session. Time is an estimate; allow for warm-ups and rest. Suggested days are editable.`,
      ...(p.days === 5 && p.experience === 'beginner'
        ? [
            'The fifth day is light technique practice with three movements and two sets. Start with fewer sessions if recovery feels difficult.',
          ]
        : []),
      ...(limited
        ? [
            'With limited equipment, upper-back control work stands in for loaded pulling. It is not an equivalent strength stimulus; add dumbbells or a cable option later for more balanced pulling.',
          ]
        : []),
      guidanceDescriptions[p.guidance],
      'Use a manageable starting load and controlled repetitions. Plank targets are seconds; log bodyweight movements with 0 kg.',
    ],
  };
}
export function availableExercises(p: TrainingPreferences): Exercise[] {
  return exercises.filter(
    (e) =>
      e.equipment === 'Bodyweight' ||
      p.equipment.includes(
        e.equipment as TrainingPreferences['equipment'][number],
      ),
  );
}
