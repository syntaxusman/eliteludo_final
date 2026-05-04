import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Images } from '@/src/assets';
import { useAuthStore } from '@/src/stores/auth';
import { useSettingsStore } from '@/src/stores/settings';
import { colors } from '@/src/theme/colors';

const { width: SCREEN_W } = Dimensions.get('window');
const BAR_W = SCREEN_W - 80;

const LOADING_TIPS = [
  'Loading your kingdom…',
  'Polishing the golden dice…',
  'Preparing the royal board…',
  'Summoning your rivals…',
  'Checking your crown…',
  'Ready to roll!',
];

const SPLASH_DURATION = 3200; // ms — minimum display time
const TIP_INTERVAL = 530;     // ms per tip

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const session = useAuthStore((s) => s.session);

  const [splashDone, setSplashDone] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);

  // Progress bar 0 → 1 over SPLASH_DURATION
  const progress = useSharedValue(0);
  // Board entrance: scale + opacity
  const boardScale = useSharedValue(0.7);
  const boardOpacity = useSharedValue(0);
  // Logo glow pulse
  const glow = useSharedValue(0.5);

  const tipRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    hydrateSettings();

    // Start progress bar
    progress.value = withTiming(1, {
      duration: SPLASH_DURATION,
      easing: Easing.out(Easing.quad),
    }, (finished) => {
      if (finished) runOnJS(setSplashDone)(true);
    });

    // Board entrance
    boardScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.1)) });
    boardOpacity.value = withTiming(1, { duration: 700 });

    // Glow pulse
    glow.value = withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) });

    // Cycle loading tips
    let idx = 0;
    tipRef.current = setInterval(() => {
      setTipVisible(false);
      setTimeout(() => {
        idx = Math.min(idx + 1, LOADING_TIPS.length - 1);
        setTipIndex(idx);
        setTipVisible(true);
      }, 180);
    }, TIP_INTERVAL);

    return () => {
      if (tipRef.current) clearInterval(tipRef.current);
    };
  }, []);

  // Navigate once splash played AND auth resolved
  useEffect(() => {
    if (!splashDone || isHydrating) return;
    if (tipRef.current) clearInterval(tipRef.current);
    if (session) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/auth/login');
    }
  }, [splashDone, isHydrating, session]);

  const barStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [0, BAR_W]),
  }));

  const boardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: boardScale.value }],
    opacity: boardOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0.3, 0.75]),
  }));

  return (
    <ImageBackground source={Images.bgHome} style={styles.root} resizeMode="cover">
      {/* Dark overlay */}
      <View style={styles.overlay} />

      {/* Top logo area */}
      <Animated.View
        entering={FadeIn.delay(100).duration(700)}
        style={[styles.logoSection, { paddingTop: insets.top + 40 }]}
      >
        {/* Glow bloom behind text */}
        <Animated.View style={[styles.logoGlow, glowStyle]} />
        <Text style={styles.logoElite}>ELITE</Text>
        <View style={styles.logoDivider} />
        <Text style={styles.logoLudo}>LUDO</Text>
        <Text style={styles.logoTagline}>ROLL LIKE ROYALTY</Text>
      </Animated.View>

      {/* Hero board */}
      <Animated.View style={[styles.boardWrap, boardStyle]}>
        <Image
          source={Images.boardMini}
          style={styles.boardImg}
          resizeMode="contain"
        />
        {/* Soft glow under the board */}
        <View style={styles.boardGlow} />
      </Animated.View>

      {/* Bottom loading section */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(600)}
        style={[styles.bottomSection, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* Loading tip */}
        <Animated.Text
          key={tipIndex}
          entering={FadeIn.duration(200)}
          style={[styles.tipText, !tipVisible && styles.tipHidden]}
        >
          {LOADING_TIPS[tipIndex]}
        </Animated.Text>

        {/* Progress bar track */}
        <View style={styles.barTrack}>
          {/* Inner shimmer segments for texture */}
          <LinearGradient
            colors={['rgba(212,175,55,0.08)', 'rgba(212,175,55,0.12)', 'rgba(212,175,55,0.08)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Filled portion */}
          <Animated.View style={[styles.barFill, barStyle]}>
            <LinearGradient
              colors={[colors.goldDark, colors.gold, colors.goldLight, colors.gold]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Shine dot at the leading edge */}
            <View style={styles.barShine} />
          </Animated.View>
        </View>

        {/* Version / edition */}
        <Text style={styles.versionText}>2026 Edition · Elite Season</Text>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    zIndex: 1,
  },
  logoGlow: {
    position: 'absolute',
    top: 36,
    width: 280,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212,175,55,0.25)',
    transform: [{ scaleX: 1.4 }],
  },
  logoElite: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.gold,
    letterSpacing: 12,
    textShadowColor: 'rgba(212,175,55,0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
    lineHeight: 58,
  },
  logoDivider: {
    width: 56,
    height: 1.5,
    backgroundColor: colors.gold,
    opacity: 0.7,
    marginVertical: 4,
  },
  logoLudo: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.goldLight,
    letterSpacing: 16,
    textShadowColor: 'rgba(212,175,55,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  logoTagline: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(212,175,55,0.55)',
    letterSpacing: 5,
    marginTop: 12,
  },

  // Board
  boardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardImg: {
    width: SCREEN_W * 0.78,
    height: SCREEN_W * 0.78,
  },
  boardGlow: {
    position: 'absolute',
    bottom: -20,
    width: SCREEN_W * 0.6,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212,175,55,0.12)',
    transform: [{ scaleX: 1.2 }],
  },

  // Bottom
  bottomSection: {
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 40,
    zIndex: 1,
  },
  tipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    minHeight: 18,
  },
  tipHidden: { opacity: 0 },

  // Progress bar
  barTrack: {
    width: BAR_W,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(212,175,55,0.2)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barShine: {
    position: 'absolute',
    right: 0,
    top: -1,
    width: 6,
    height: 7,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  versionText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '500',
  },
});
