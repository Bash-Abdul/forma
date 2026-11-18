import { useTheme } from '@/theme/provider';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import {
  Back,
  Card,
  Chip,
  Heading,
  ListRow,
  Screen,
  useUiStyles,
} from '@/components/ui';
import { LearningTopic } from '@/types';

import { articles, topicLabels } from '../services/articles';
export default function LearnScreen() {
  const s = useUiStyles();
  const { colors: c } = useTheme();

  const { topic } = useLocalSearchParams<{ topic?: string }>();
  const [filter, setFilter] = useState<string>(
    topic && topic in topicLabels ? topic : 'all',
  );
  const list = articles.filter((a) => filter === 'all' || a.topic === filter);
  return (
    <Screen>
      <Back />
      <Heading
        title={
          filter === 'nutrition' ? 'Nutrition, explained' : 'Learn with Forma'
        }
        detail="Short guides to training, nutrition and consistency."
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {['all', ...Object.keys(topicLabels)].map((value) => (
          <Chip
            key={value}
            label={
              value === 'all'
                ? 'All topics'
                : topicLabels[value as LearningTopic]
            }
            selected={filter === value}
            onPress={() => setFilter(value)}
          />
        ))}
      </View>
      {filter === 'nutrition' ? (
        <Text style={s.small}>
          Education is available now. Meal logging, calorie targets and food
          tracking are future features.
        </Text>
      ) : null}
      <Card style={{ paddingVertical: 4 }}>
        {list.map((article, index) => (
          <View key={article.id}>
            {index ? <View style={s.divider} /> : null}
            <ListRow
              title={article.title}
              detail={`${topicLabels[article.topic]} · ${article.minutes} min read`}
              icon={<BookOpen color={c.primary} size={20} />}
              onPress={() =>
                router.push({
                  pathname: '/article',
                  params: { id: article.id },
                })
              }
            />
          </View>
        ))}
      </Card>
    </Screen>
  );
}
