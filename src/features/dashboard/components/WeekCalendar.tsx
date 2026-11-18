import { fonts } from '@/theme/typography';
import { StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { AppData } from '@/types';
import { Palette } from '@/theme';
import { useTheme, useThemedStyles } from '@/theme/provider';
import { useUiStyles } from '@/components/ui';
import { weekOverview } from '../services';
export function WeekCalendar({ data }: { data: AppData }) {
  const { colors: c } = useTheme();
  const styles = useThemedStyles(createStyles);
  const s = useUiStyles();
  const days = weekOverview(data);
  const completed = days.filter((d) => d.completed).length;
  return (
    <View style={{ gap: 16 }}>
      <View style={s.section}>
        <Text style={s.rowTitle}>This week</Text>
        <Text style={s.small}>
          {completed} {completed === 1 ? 'day' : 'days'} trained
        </Text>
      </View>
      <View style={styles.week}>
        {days.map((day) => (
          <View
            key={day.key}
            accessibilityLabel={`${day.label}, ${day.date}${day.today ? ', today' : ''}${day.completed ? ', workout completed' : day.scheduled ? ', workout planned' : ''}`}
            style={[styles.day, day.today && styles.today]}
          >
            <Text style={[styles.label, day.today && { color: c.onPrimary }]}>
              {day.label}
            </Text>
            <Text style={[styles.date, day.today && { color: c.onPrimary }]}>
              {day.date}
            </Text>
            <View style={styles.mark}>
              {day.completed ? (
                <Check size={13} color={day.today ? c.onPrimary : c.primary} />
              ) : (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: day.scheduled
                      ? day.today
                        ? c.onPrimary
                        : c.primary
                      : 'transparent',
                  }}
                />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
const createStyles = (c: Palette) =>
  StyleSheet.create({
    week: { flexDirection: 'row', gap: 6 },
    day: {
      flex: 1,
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 8,
      gap: 8,
      borderRadius: 2,
      backgroundColor: 'transparent',
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    today: { backgroundColor: c.primary, borderTopColor: c.primary },
    label: { color: c.muted, fontSize: 11, fontFamily: fonts.medium },
    date: { color: c.text, fontSize: 27, fontFamily: fonts.display },
    mark: { height: 13, alignItems: 'center', justifyContent: 'center' },
  });
