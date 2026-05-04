import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { DailyRewardModal } from '@/src/components/DailyRewardModal';
import { Images } from '@/src/assets';
import { useWalletStore } from '@/src/stores/wallet';
import { colors } from '@/src/theme/colors';
import { haptics } from '@/src/utils/haptics';

const GAME_MODES = [
  { id: '4player', label: '4 Player', icon: 'people-circle' as const, color: colors.green },
  { id: 'vs-ai', label: 'Vs Computer', icon: 'desktop' as const, color: colors.red },
  { id: 'private', label: 'Private Room', icon: 'key' as const, color: colors.blue },
];

export default function HomeScreen() {
  const router = useRouter();
  const coins = useWalletStore((s) => s.coins);
  const hydrated = useWalletStore((s) => s.hydrated);
  const hydrate = useWalletStore((s) => s.hydrate);
  const claimDaily = useWalletStore((s) => s.claimDaily);
  const pendingClaim = useWalletStore((s) => s.pendingClaim);

  const [rewardOpen, setRewardOpen] = useState(false);
  const [pendingDay, setPendingDay] = useState(1);

  const glowOpacity = useSharedValue(0.6);

  useEffect(() => {
    hydrate();
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.6, { duration: 1500 }),
      ),
      -1,
    );
  }, [hydrate, glowOpacity]);

  useEffect(() => {
    if (!hydrated || rewardOpen) return;
    const pending = pendingClaim();
    if (pending) {
      setPendingDay(pending.day);
      setRewardOpen(true);
    }
  }, [hydrated, pendingClaim, rewardOpen]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const onClaim = () => {
    const result = claimDaily();
    if (result) haptics.success();
    setRewardOpen(false);
  };

  const startGame = (mode: string) => {
    haptics.tap();
    if (mode === 'vs-ai') router.push('/game/new');
    else router.push('/game/matchmaking');
  };

  return (
    <ImageBackground source={Images.bgHome} style={styles.root} resizeMode="cover">
      {/* Dark overlay to deepen the background */}
      <View style={styles.overlay} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => { haptics.tap(); router.push('/settings'); }}
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={22} color={colors.gold} />
        </Pressable>

        <View style={styles.coinBadge}>
          <Image source={Images.coinSingle} style={styles.coinIcon} />
          <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View entering={FadeIn.delay(100).duration(600)} style={styles.logoSection}>
          <Animated.View style={[styles.logoGlow, glowStyle]} />
          <Text style={styles.logoElite}>ELITE</Text>
          <Text style={styles.logoLudo}>LUDO</Text>
          <Text style={styles.logoTagline}>ROLL LIKE ROYALTY</Text>
        </Animated.View>

        {/* Hero board */}
        <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.heroWrap}>
          <Image source={Images.boardMini} style={styles.heroBoard} resizeMode="contain" />
        </Animated.View>

        {/* Primary CTA — Play 1 on 1 */}
        <Animated.View entering={FadeInDown.delay(350).duration(500)} style={styles.primaryCta}>
          <Pressable
            onPress={() => startGame('1v1')}
            style={({ pressed }) => [styles.playBtnOuter, pressed && { opacity: 0.88 }]}
          >
            <LinearGradient
              colors={['#3EC55A', '#2D8C3E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.playBtnGradient}
            >
              <Ionicons name="people" size={22} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.playBtnText}>Play 1 on 1</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Other modes */}
        <Animated.View entering={FadeInDown.delay(480).duration(500)} style={styles.modesGrid}>
          {GAME_MODES.map((mode) => (
            <Pressable
              key={mode.id}
              onPress={() => startGame(mode.id)}
              style={({ pressed }) => [styles.modeCard, pressed && { opacity: 0.8 }]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                style={StyleSheet.absoluteFill}
              />
              {/* gold top border line */}
              <View style={[styles.modeCardTopLine, { backgroundColor: mode.color }]} />
              <View style={[styles.modeIconWrap, { backgroundColor: mode.color + '22' }]}>
                <Ionicons name={mode.icon} size={24} color={mode.color} />
              </View>
              <Text style={styles.modeLabelText}>{mode.label}</Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Weekly leaderboard tiles */}
        <Animated.View entering={FadeInDown.delay(580).duration(500)} style={styles.leaderRow}>
          {['Weekly\nLeaderboard', 'Daily\nChallenge'].map((label) => (
            <Pressable key={label} style={styles.leaderTile}>
              <LinearGradient
                colors={['rgba(212,175,55,0.12)', 'rgba(212,175,55,0.04)']}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="trophy-outline" size={20} color={colors.gold} />
              <Text style={styles.leaderLabel}>{label}</Text>
              <Text style={styles.leaderSub}>Coming soon</Text>
            </Pressable>
          ))}
        </Animated.View>
      </ScrollView>

      <DailyRewardModal
        visible={rewardOpen}
        pendingDay={pendingDay}
        onClaim={onClaim}
        onClose={() => setRewardOpen(false)}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 8,
    zIndex: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coinIcon: { width: 20, height: 20, resizeMode: 'contain' },
  coinText: { color: colors.gold, fontWeight: '700', fontSize: 15 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 110 },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
  },
  logoGlow: {
    position: 'absolute',
    top: 0,
    width: 260,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(212,175,55,0.18)',
    transform: [{ scaleX: 1.5 }],
  },
  logoElite: {
    fontSize: 46,
    fontWeight: '900',
    color: colors.gold,
    letterSpacing: 10,
    textShadowColor: 'rgba(212,175,55,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
    lineHeight: 52,
  },
  logoLudo: {
    fontSize: 30,
    fontWeight: '300',
    color: colors.goldLight,
    letterSpacing: 14,
    textShadowColor: 'rgba(212,175,55,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  logoTagline: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(212,175,55,0.6)',
    letterSpacing: 4,
    marginTop: 6,
  },

  // Hero board
  heroWrap: {
    alignItems: 'center',
    marginTop: -4,
    marginBottom: -8,
  },
  heroBoard: {
    width: 260,
    height: 260,
    transform: [{ rotate: '-4deg' }],
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },

  // Primary CTA
  primaryCta: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  playBtnOuter: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.5)',
    shadowColor: '#2D8C3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  playBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Mode cards grid
  modesGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 16,
  },
  modeCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(20,20,22,0.75)',
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 12,
    gap: 8,
  },
  modeCardTopLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  modeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabelText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Leaderboard row
  leaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
  },
  leaderTile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    backgroundColor: 'rgba(20,20,22,0.75)',
    overflow: 'hidden',
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  leaderLabel: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  leaderSub: {
    color: colors.textDim,
    fontSize: 11,
  },
});
