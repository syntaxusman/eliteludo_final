import { router, useLocalSearchParams } from 'expo-router';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import type { Color } from '@/src/game/types';
import { Images } from '@/src/assets';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/typography';

const PLAYER_HEX: Record<Color, string> = {
  red: colors.red,
  green: colors.green,
  yellow: colors.yellow,
  blue: colors.blue,
};

export default function ResultScreen() {
  const { winner } = useLocalSearchParams<{ winner: Color }>();
  const isHumanWin = winner === 'red';

  return (
    <ImageBackground source={Images.bgHome} style={styles.root} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Heading */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.headingWrap}>
          <Text style={[styles.heading, { color: isHumanWin ? colors.gold : colors.red }]}>
            {isHumanWin ? 'VICTORY' : 'DEFEAT'}
          </Text>
          <Text style={styles.subtitle}>
            {isHumanWin ? 'You roll like royalty.' : 'The throne is not yet yours.'}
          </Text>
        </Animated.View>

        {/* Trophy / defeat icon */}
        <Animated.View entering={ZoomIn.delay(200).duration(600)} style={styles.trophyWrap}>
          {isHumanWin ? (
            <Image source={Images.trophyGold} style={styles.trophy} resizeMode="contain" />
          ) : (
            <View style={styles.defeatCircle}>
              <Text style={styles.defeatX}>✕</Text>
            </View>
          )}
        </Animated.View>

        {/* Winner badge */}
        {winner && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.winnerBadge}>
            <View style={[styles.colorDot, { backgroundColor: PLAYER_HEX[winner] }]} />
            <Text style={[styles.winnerText, { color: PLAYER_HEX[winner] }]}>
              {winner.toUpperCase()} wins
            </Text>
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.actions}>
          <Pressable
            onPress={() => router.replace('/game/new')}
            style={({ pressed }) => [styles.primaryOuter, { opacity: pressed ? 0.88 : 1 }]}
          >
            <LinearGradient
              colors={['#3EC55A', '#2D8C3E']}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={styles.primaryGradient}
            >
              <Text style={styles.primaryText}>PLAY AGAIN</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => router.replace('/')}
            style={({ pressed }) => [styles.secondaryBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.secondaryText}>BACK TO MENU</Text>
          </Pressable>
        </Animated.View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  headingWrap: { alignItems: 'center', gap: 8, marginTop: 20 },
  heading: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 6,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    textShadowColor: 'rgba(212,175,55,0.6)',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    letterSpacing: 2,
    fontWeight: '500',
  },
  trophyWrap: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  trophy: { width: 220, height: 280 },
  defeatCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(226,87,76,0.1)',
  },
  defeatX: { fontSize: 64, color: colors.red, fontWeight: '200' },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  winnerText: { fontSize: 15, fontWeight: '700', letterSpacing: 2 },
  actions: { gap: spacing.md, alignSelf: 'stretch' },
  primaryOuter: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.5)',
  },
  primaryGradient: { height: 54, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 3 },
  secondaryBtn: {
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: colors.textMuted, fontSize: 15, fontWeight: '600', letterSpacing: 2 },
});
