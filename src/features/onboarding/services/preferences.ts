import { z } from 'zod';
import { TrainingPreferences } from '@/types';
export const preferencesSchema = z
  .object({
    goal: z.enum(['strength', 'muscle', 'fitness', 'weight-loss']),
    experience: z.enum(['beginner', 'intermediate', 'advanced']),
    days: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    duration: z.union([z.literal(30), z.literal(45), z.literal(60)]),
    equipment: z
      .array(z.enum(['Bodyweight', 'Dumbbell', 'Barbell', 'Cable', 'Machine']))
      .min(1, 'Select at least one equipment option.'),
    equipmentKnowledge: z.enum(['known', 'unsure']).optional(),
    guidance: z.enum(['guided', 'flexible', 'independent']),
  })
  .refine(
    (p) =>
      p.equipmentKnowledge !== 'unsure' ||
      (p.equipment.length === 1 && p.equipment[0] === 'Bodyweight'),
    {
      path: ['equipment'],
      message: 'If you are unsure, use the equipment-free starting option.',
    },
  );
export const defaultPreferences: TrainingPreferences = {
  goal: 'fitness',
  experience: 'beginner',
  days: 3,
  duration: 45,
  equipment: ['Bodyweight'],
  equipmentKnowledge: 'unsure',
  guidance: 'guided',
};
export const goalLabels = {
  'weight-loss': 'Lose weight',
  strength: 'Build strength',
  muscle: 'Build muscle',
  fitness: 'General fitness',
};
export const experienceLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Experienced',
};
export const guidanceLabels = {
  guided: 'Guided training',
  flexible: 'Flexible recommendations',
  independent: 'Independent training',
};
export const guidanceDescriptions = {
  guided:
    'Start with a structured week and clear set targets. Review the plan before it becomes part of your training.',
  flexible:
    'Use the plan as a starting point. Swap movements, adjust days and choose which routines to follow.',
  independent:
    'Keep full control of your routines. Save preferences on their own, or optionally generate a starting plan.',
};
