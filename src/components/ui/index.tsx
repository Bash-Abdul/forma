import { ReactNode, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowUpRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors as c } from '@/theme';
import { useData } from '@/lib/store';
export function Screen({
  children,
  scrollKey,
}: {
  children: ReactNode;
  scrollKey?: string | number;
}) {
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [scrollKey]);
  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={s.page}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function Heading({
  eyebrow,
  title,
  detail,
  right,
}: {
  eyebrow?: string;
  title: string;
  detail?: string;
  right?: ReactNode;
}) {
  return (
    <View style={s.heading}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" style={s.title}>
          {title}
        </Text>
        {detail ? <Text style={s.subtitle}>{detail}</Text> : null}
      </View>
      {right}
    </View>
  );
}
export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={s.section}>
      <Text accessibilityRole="header" style={s.sectionTitle}>
        {title}
      </Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onPress} hitSlop={12}>
          <Text style={s.link}>{action} ↗</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
      ]}
    >
      {icon}
      <Text style={[s.buttonText, secondary && { color: c.primary }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 8, flex: 1 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.muted}
        style={s.input}
        {...props}
      />
    </View>
  );
}
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        s.chip,
        selected && { backgroundColor: c.primary, borderColor: c.primary },
      ]}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: selected ? 'white' : c.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Back({ label = 'Back' }: { label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={s.back}
    >
      <ArrowLeft size={19} color={c.primary} />
      <Text style={s.link}>{label}</Text>
    </Pressable>
  );
}
export function DataGate({ children }: { children: ReactNode }) {
  const q = useData();
  if (q.isPending)
    return (
      <Screen>
        <ActivityIndicator color={c.primary} />
        <Text style={s.body}>Preparing your training space…</Text>
      </Screen>
    );
  if (q.isError)
    return (
      <Screen>
        <Heading
          title="Couldn’t load your data"
          detail="Your saved data has been kept. Please try again."
        />
        <Button label="Try again" onPress={() => void q.refetch()} />
      </Screen>
    );
  return <>{children}</>;
}
export function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <Card>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={s.body}>{detail}</Text>
    </Card>
  );
}
export function ListRow({
  title,
  detail,
  onPress,
  icon,
}: {
  title: string;
  detail: string;
  onPress?: () => void;
  icon?: ReactNode;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={s.listRow}>
      <View style={s.iconBox}>{icon}</View>
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.small}>{detail}</Text>
      </View>
      <ArrowUpRight size={18} color={c.muted} />
    </Pressable>
  );
}
export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  page: {
    padding: 24,
    paddingBottom: 40,
    gap: 20,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: c.primary,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1.3,
    color: c.text,
  },
  subtitle: { fontSize: 14, color: c.muted, marginTop: 9, lineHeight: 21 },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: c.text,
  },
  link: { fontSize: 12, fontWeight: '600', color: c.primary },
  card: {
    backgroundColor: c.card,
    borderRadius: 10,
    padding: 20,
    borderWidth: 0,
    gap: 14,
  },
  button: {
    minHeight: 50,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 8,
    backgroundColor: c.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: { fontSize: 14, fontWeight: '700', color: 'white' },
  secondary: { backgroundColor: c.pale },
  label: { fontSize: 12, fontWeight: '600', color: c.text },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 14,
    color: c.text,
    fontSize: 15,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: 'white',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  body: { fontSize: 14, color: c.muted, lineHeight: 22 },
  small: { fontSize: 12, color: c.muted, lineHeight: 18 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: c.text },
  listRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    paddingVertical: 13,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: c.pale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  error: { color: c.danger, fontSize: 12, lineHeight: 18 },
  metric: { fontSize: 28, fontWeight: '700', color: c.text, letterSpacing: -1 },
  divider: { height: 1, backgroundColor: c.line },
});
