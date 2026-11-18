import { fonts } from '@/theme/typography';
import { Palette } from '@/theme';
import { useTheme, useThemedStyles } from '@/theme/provider';
import { ReactNode, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

import { useData, useMemorySession, usePersistence } from '@/lib/store';
export function Screen({
  children,
  scrollKey,
  footer,
}: {
  children: ReactNode;
  scrollKey?: string | number;
  footer?: ReactNode;
}) {
  const s = useUiStyles();
  const { colors: c } = useTheme();

  const scrollRef = useRef<ScrollViewInstance>(null);
  const { memoryOnly } = usePersistence();
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [scrollKey]);
  return (
    <SafeAreaView
      style={s.safe}
      edges={
        footer ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']
      }
    >
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={s.page}
      >
        {memoryOnly ? (
          <Text accessibilityRole="alert" style={s.error}>
            Session only: local storage is unavailable. Changes will not be
            saved after closing the app.
          </Text>
        ) : null}
        {children}
      </ScrollView>
      {footer ? (
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderTopColor: c.line,
            width: '100%',
            maxWidth: 760,
            alignSelf: 'center',
            gap: 10,
          }}
        >
          {footer}
        </View>
      ) : null}
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
  const s = useUiStyles();

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
  const s = useUiStyles();

  return (
    <View style={s.section}>
      <Text
        accessibilityRole="header"
        style={[s.sectionTitle, { flex: 1, marginRight: 12 }]}
      >
        {title}
      </Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onPress} hitSlop={12}>
          <Text style={s.link}>{action}</Text>
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
  const s = useUiStyles();

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
  const s = useUiStyles();
  const { colors: c } = useTheme();

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
  const s = useUiStyles();
  const { colors: c } = useTheme();

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
  const s = useUiStyles();
  const { colors: c } = useTheme();

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
          fontFamily: fonts.semibold,
          color: selected ? c.onPrimary : c.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Back({ label = 'Back' }: { label?: string }) {
  const s = useUiStyles();
  const { colors: c } = useTheme();

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
  const s = useUiStyles();
  const { colors: c } = useTheme();

  const q = useData();
  const memorySession = useMemorySession();
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
          detail="Your saved data has been kept. Retry, or explore a temporary session without changing your stored records."
        />
        <Button label="Try again" onPress={() => void q.refetch()} />
        <Button
          secondary
          label="Continue without saving"
          onPress={memorySession}
        />
      </Screen>
    );
  return <>{children}</>;
}
export function Empty({ title, detail }: { title: string; detail: string }) {
  const s = useUiStyles();

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
  const s = useUiStyles();
  const { colors: c } = useTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={s.listRow}
    >
      {icon ? <View style={s.iconBox}>{icon}</View> : null}
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.small}>{detail}</Text>
      </View>
      {onPress ? (
        <ChevronRight size={16} color={c.muted} strokeWidth={1.5} />
      ) : null}
    </Pressable>
  );
}
const createUiStyles = (c: Palette) =>
  StyleSheet.create({
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
      fontFamily: fonts.semibold,
      letterSpacing: 1.2,
      color: c.primary,
      marginBottom: 10,
    },
    title: {
      fontSize: 42,
      fontFamily: fonts.display,
      letterSpacing: -0.3,
      lineHeight: 46,
      color: c.text,
    },
    subtitle: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: c.muted,
      marginTop: 9,
      lineHeight: 21,
    },
    section: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 6,
    },
    sectionTitle: {
      fontSize: 25,
      fontFamily: fonts.display,
      letterSpacing: 0,
      color: c.text,
    },
    link: { fontSize: 12, fontFamily: fonts.semibold, color: c.primary },
    card: {
      backgroundColor: c.card,
      borderRadius: 2,
      padding: 20,
      borderWidth: 0,
      gap: 14,
    },
    button: {
      minHeight: 50,
      paddingHorizontal: 18,
      paddingVertical: 13,
      borderRadius: 3,
      backgroundColor: c.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    buttonText: {
      fontSize: 14,
      fontFamily: fonts.semibold,
      color: c.onPrimary,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: c.line,
    },
    label: { fontSize: 12, fontFamily: fonts.semibold, color: c.text },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.card,
      borderRadius: 3,
      paddingHorizontal: 14,
      color: c.text,
      fontFamily: fonts.regular,
      fontSize: 15,
    },
    chip: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: 'transparent',
    },
    back: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
    },
    body: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: c.muted,
      lineHeight: 22,
    },
    small: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.muted,
      lineHeight: 18,
    },
    rowTitle: { fontSize: 14, fontFamily: fonts.semibold, color: c.text },
    listRow: {
      flexDirection: 'row',
      gap: 14,
      alignItems: 'center',
      paddingVertical: 13,
    },
    iconBox: {
      width: 24,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    error: {
      fontFamily: fonts.regular,
      color: c.danger,
      fontSize: 12,
      lineHeight: 18,
    },
    metric: {
      fontSize: 40,
      fontFamily: fonts.display,
      fontVariant: ['tabular-nums'],
      color: c.text,
      letterSpacing: -1,
    },
    divider: { height: 1, backgroundColor: c.line },
  });

export function useUiStyles() {
  return useThemedStyles(createUiStyles);
}
