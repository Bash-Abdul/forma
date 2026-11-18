import { useState } from 'react';
import { Linking, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Back,
  Button,
  Card,
  Heading,
  Screen,
  useUiStyles,
} from '@/components/ui';
import { articles, topicLabels } from '../services/articles';
export default function ArticleScreen() {
  const s = useUiStyles();

  const { id } = useLocalSearchParams<{ id: string }>();
  const [error, setError] = useState('');
  const article = articles.find((a) => a.id === id);
  if (!article)
    return (
      <Screen>
        <Back />
        <Heading title="Guide not found" />
        <Button
          label="Browse learning"
          onPress={() => router.replace('/learn')}
        />
      </Screen>
    );
  return (
    <Screen>
      <Back />
      <Heading
        eyebrow={`${topicLabels[article.topic].toUpperCase()} · ${article.minutes} MIN READ`}
        title={article.title}
        detail={article.summary}
      />
      <Card>
        {article.paragraphs.map((text, index) => (
          <Text key={index} style={s.body}>
            {text}
          </Text>
        ))}
      </Card>
      {article.source ? (
        <Button
          secondary
          label={article.source.label}
          onPress={() =>
            void Linking.openURL(article.source!.url).catch(() =>
              setError(
                'Couldn’t open the source. Check your connection and try again.',
              ),
            )
          }
        />
      ) : null}
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Button
        label="Explore exercise library"
        secondary
        onPress={() => router.push('/exercises')}
      />
    </Screen>
  );
}
