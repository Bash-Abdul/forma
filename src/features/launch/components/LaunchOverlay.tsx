import { fonts } from '@/theme/typography';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  StyleSheet,
  Text,
} from 'react-native';
export function LaunchOverlay({ onFinish }: { onFinish: () => void }) {
  const [styles] = useState(createStyles);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const opacity = useState(() => new Animated.Value(0))[0];
  const overlayOpacity = useState(() => new Animated.Value(1))[0];
  const scale = useState(() => new Animated.Value(0.96))[0];
  const finished = useRef(false);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduced(value);
      })
      .catch(() => {
        if (active) setReduced(true);
      });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduced,
    );
    const fallback = setTimeout(() => {
      if (active) setReduced((current) => current ?? true);
    }, 250);
    return () => {
      active = false;
      clearTimeout(fallback);
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    if (reduced === null) return;
    const done = () => {
      if (!finished.current) {
        finished.current = true;
        onFinish();
      }
    };
    if (reduced) {
      opacity.setValue(1);
      scale.setValue(1);
      const timer = setTimeout(done, 250);
      return () => clearTimeout(timer);
    }
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      Animated.delay(800),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]);
    animation.start(({ finished: complete }) => {
      if (complete) done();
    });
    return () => animation.stop();
  }, [reduced, opacity, scale, overlayOpacity, onFinish]);
  return (
    <Animated.View
      accessibilityLabel="Forma. Fitness that fits you."
      accessibilityViewIsModal
      style={[styles.overlay, { opacity: overlayOpacity }]}
    >
      <Animated.View
        style={{
          alignItems: 'center',
          gap: 14,
          opacity,
          transform: [{ scale }],
        }}
      >
        <Text style={styles.wordmark}>
          forma<Text style={{ color: '#DCEF99' }}>.</Text>
        </Text>
        <Text style={styles.tagline}>Fitness that fits you.</Text>
      </Animated.View>
    </Animated.View>
  );
}
const createStyles = () =>
  StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#192C29',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    wordmark: {
      fontSize: 62,
      fontFamily: fonts.semibold,
      letterSpacing: -3,
      color: '#FFFFFF',
    },
    tagline: {
      fontFamily: fonts.regular,
      fontSize: 15,
      color: '#C2D0C8',
      letterSpacing: 0.3,
    },
  });
