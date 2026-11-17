import { Text, View, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { router } from 'expo-router';
import {
  Button,
  Card,
  Empty,
  Heading,
  Screen,
  Section,
  s,
} from '@/components/ui';
import { useData } from '@/lib/store';
import { volume, weekStart } from '@/lib/training';
import { colors as c } from '@/theme';
export default function ProgressScreen() {
  const { data } = useData();
  const { width } = useWindowDimensions();
  if (!data) return null;
  const entries = data.weights.slice(-12);
  const first = data.weights[0]?.kg;
  const latest = data.weights.at(-1)?.kg;
  const change =
    latest !== undefined && first !== undefined ? latest - first : 0;
  return (
    <Screen>
      <Heading
        eyebrow="THE BIGGER PICTURE"
        title="Your progress"
        detail="Notice the small wins. They add up."
      />
      <View style={s.row}>
        <Card style={{ flex: 1 }}>
          <Text style={s.small}>Total sessions</Text>
          <Text style={s.metric}>{data.workouts.length}</Text>
          <Text style={s.small}>
            {
              data.workouts.filter(
                (w) => new Date(w.finishedAt!) >= weekStart(),
              ).length
            }{' '}
            this week
          </Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={s.small}>Volume lifted</Text>
          <Text style={s.metric}>
            {(data.workouts.reduce((n, w) => n + volume(w), 0) / 1000).toFixed(
              1,
            )}
            <Text style={s.small}> t</Text>
          </Text>
          <Text style={s.small}>Completed sets</Text>
        </Card>
      </View>
      <Section
        title="Body weight"
        action="Log weight"
        onPress={() => router.push('/weight')}
      />
      <Card>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={s.metric}>
            {latest ?? '—'} <Text style={s.small}>kg</Text>
          </Text>
          <Text style={{ color: c.primary, fontSize: 12 }}>
            {change > 0 ? '+' : ''}
            {change.toFixed(1)} kg overall
          </Text>
        </View>
        <Text style={s.small}>Your last {entries.length} measurements</Text>
        {entries.length >= 2 ? (
          <LineChart
            data={{
              labels: entries.map((e, i) =>
                i === 0 || i === entries.length - 1
                  ? new Date(e.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : '',
              ),
              datasets: [{ data: entries.map((e) => e.kg) }],
            }}
            width={Math.max(220, Math.min(width, 760) - 96)}
            height={190}
            yAxisSuffix=""
            withInnerLines
            withOuterLines={false}
            withVerticalLines={false}
            chartConfig={{
              backgroundGradientFrom: 'white',
              backgroundGradientTo: 'white',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(38,113,92,${opacity})`,
              labelColor: () => c.muted,
              propsForDots: { r: '4', strokeWidth: '2', stroke: 'white' },
              propsForBackgroundLines: {
                stroke: c.line,
                strokeDasharray: '4 4',
              },
              fillShadowGradient: c.primary,
              fillShadowGradientOpacity: 0.08,
            }}
            bezier
            style={{ marginLeft: -12, borderRadius: 12 }}
          />
        ) : (
          <Text style={s.body}>
            Log at least two measurements to see your trend.
          </Text>
        )}
      </Card>
      <Section title="Weight history" />
      {entries.length ? (
        <Card>
          {[...entries].reverse().map((e) => (
            <View
              key={e.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 8,
              }}
            >
              <Text style={s.body}>
                {new Date(e.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              <Text style={s.rowTitle}>{e.kg} kg</Text>
            </View>
          ))}
        </Card>
      ) : (
        <Empty
          title="Start with a check-in"
          detail="Your weight entries will appear here."
        />
      )}
      <Button
        label="Review workout history"
        secondary
        onPress={() => router.push('/history')}
      />
      <Text style={s.small}>
        Progress has many forms: strength, energy, consistency and how you feel.
        Weight is just one of them.
      </Text>
    </Screen>
  );
}
