import { fonts } from '@/theme/typography';
import { useTheme } from '@/theme/provider';
import { Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { WeightEntry } from '@/types';
import {
  Units,
  toDisplayWeight,
  weightUnit,
} from '@/features/profile/services/measurements';

import { useUiStyles } from '@/components/ui';
export function WeightTrend({
  entries,
  units,
}: {
  entries: WeightEntry[];
  units: Units;
}) {
  const s = useUiStyles();
  const { colors: c } = useTheme();

  const { width } = useWindowDimensions();
  const list = entries.slice(-12);
  if (list.length < 2)
    return (
      <Text style={s.body}>
        Log at least two measurements to see a trend. Missing days stay empty.
      </Text>
    );
  return (
    <LineChart
      data={{
        labels: list.map((e, i) =>
          i === 0 || i === list.length - 1
            ? new Date(e.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })
            : '',
        ),
        datasets: [{ data: list.map((e) => toDisplayWeight(e.kg, units)) }],
      }}
      width={Math.max(210, Math.min(width, 760) - 96)}
      height={180}
      yAxisSuffix={` ${weightUnit(units)}`}
      withInnerLines
      withOuterLines={false}
      withVerticalLines={false}
      chartConfig={{
        backgroundGradientFrom: c.card,
        backgroundGradientTo: c.card,
        decimalPlaces: 1,
        color: () => c.primary,
        labelColor: () => c.muted,
        propsForLabels: { fontFamily: fonts.regular, fontSize: 11 },
        propsForDots: { r: '3' },
        propsForBackgroundLines: { stroke: c.line },
        fillShadowGradient: c.primary,
        fillShadowGradientOpacity: 0.06,
      }}
      style={{ marginLeft: -12 }}
    />
  );
}
