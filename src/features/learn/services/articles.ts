import { FitnessProfile, LearningTopic } from '@/types';
export type Article = {
  id: string;
  topic: LearningTopic;
  title: string;
  summary: string;
  minutes: number;
  paragraphs: string[];
  source?: { label: string; url: string };
};
export const topicLabels: Record<LearningTopic, string> = {
  fundamentals: 'Fundamentals',
  strength: 'Strength training',
  consistency: 'Consistency',
  weight: 'Weight & progress',
  nutrition: 'Nutrition',
};
export const articles: Article[] = [
  {
    id: 'start-here',
    topic: 'fundamentals',
    title: 'Fitness, without the jargon',
    summary:
      'A simple introduction to moving, training and finding your own starting point.',
    minutes: 2,
    paragraphs: [
      'Fitness includes different abilities, such as strength and endurance. You do not need to understand everything before choosing a first step.',
      'Strength work makes your muscles work against resistance. That resistance can be your own bodyweight, a handheld weight or a machine.',
      'In Forma, a routine is a plan you can use again. A workout is a session you actually did. Your records keep those two things separate.',
    ],
    source: {
      label: 'NHS: strength and flexibility',
      url: 'https://www.nhs.uk/live-well/exercise/how-to-improve-strength-flexibility/',
    },
  },
  {
    id: 'sets-reps',
    topic: 'strength',
    title: 'What are sets and reps?',
    summary: 'Understand the numbers next to an exercise.',
    minutes: 2,
    paragraphs: [
      'A repetition, or rep, is one complete movement. A set groups several reps together before a break.',
      'Two sets of eight reps means performing the movement eight times, resting, then doing another eight. In Forma, plank targets use seconds instead of reps.',
      'You can look up an exercise in the library before trying it. Start gradually, and take time to learn a controlled movement.',
    ],
    source: {
      label: 'NHS: strength and flexibility',
      url: 'https://www.nhs.uk/live-well/exercise/how-to-improve-strength-flexibility/',
    },
  },
  {
    id: 'small-routine',
    topic: 'consistency',
    title: 'Make your next step small',
    summary:
      'Choose a week you can come back to, rather than an ideal week on paper.',
    minutes: 2,
    paragraphs: [
      'Pick a practical action: read one exercise instruction, plan your next session or record a check-in.',
      'A routine is allowed to change. Choose days that fit your life and revisit the plan when your circumstances change.',
      'Forma keeps your old sessions when you edit a routine or choose a new plan. You are building a record, not starting over.',
    ],
  },
  {
    id: 'read-progress',
    topic: 'weight',
    title: 'Read your progress with context',
    summary: 'What your weight chart and training history actually show.',
    minutes: 2,
    paragraphs: [
      'Each point on your weight chart is a measurement you saved. Forma does not fill in missing days or predict future weight.',
      'Your profile’s starting weight is shown separately until you log a measurement. An activity estimate in your profile is not a measured step count for today.',
      'Use the dates and notes around your own records to understand the picture. Training consistency, completed repetitions and how you feel can be useful things to reflect on too.',
    ],
  },
  {
    id: 'nutrition-basics',
    topic: 'nutrition',
    title: 'A first look at balanced eating',
    summary: 'Get familiar with food groups before worrying about numbers.',
    minutes: 3,
    paragraphs: [
      'A varied diet includes fruit and vegetables, starchy foods, protein foods, dairy or alternatives, and some fats.',
      'Think about the overall balance of what you eat across a day or week. Every meal does not need to look identical.',
      'Starchy foods provide energy. Beans, pulses, eggs, fish and meat are examples of protein foods. Dairy and alternatives can contribute calcium.',
      'This version of Forma provides education. Meal logging, calorie targets and nutrition tracking are not available yet.',
    ],
    source: {
      label: 'NHS: The Eatwell Guide',
      url: 'https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/the-eatwell-guide/',
    },
  },
  {
    id: 'calories-macros',
    topic: 'nutrition',
    title: 'Calories and macros: the words',
    summary: 'A short glossary, with no targets to hit.',
    minutes: 2,
    paragraphs: [
      'Calories describe energy in food and drink. Macronutrients, often shortened to macros, are carbohydrates, protein and fat.',
      'A nutrition label can help you learn what a food contains. A single number does not describe the whole food or decide what you should eat.',
      'Forma does not calculate a personal calorie allowance or macro prescription in this version. Start with the balanced-eating guide and explore further when you are ready.',
    ],
    source: {
      label: 'NHS: The Eatwell Guide',
      url: 'https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/the-eatwell-guide/',
    },
  },
];
export function recommendedArticles(profile: FitnessProfile): Article[] {
  const defaults: LearningTopic[] = [
    ...(profile.interests.includes('learn')
      ? (['fundamentals', 'consistency'] as const)
      : []),
    ...(profile.interests.includes('nutrition')
      ? (['nutrition'] as const)
      : []),
  ];
  const topics = profile.learning.topics.length
    ? profile.learning.topics
    : defaults.length
      ? defaults
      : ['fundamentals', 'consistency'];
  return articles
    .filter((a) => topics.includes(a.topic))
    .slice(0, profile.learning.guidance === 'less' ? 2 : 3);
}
