import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { DailyRewardModal } from '@/src/components/DailyRewardModal';
import { Images } from '@/src/assets';
import { useWalletStore } from '@/src/stores/wallet';
import { colors } from '@/src/theme/colors';
import { haptics } from '@/src/utils/haptics';

const { width: W } = Dimensions.get('window');

const CARD_W = 272;
const CARD_H = 368;
const CARD_GAP = 14;
const SIDE_INSET = (W - CARD_W) / 2;

type City = {
  id: string;
  name: string;
  subtitle: string;
  entry: number;
  prize: number;
  online: number;
  accentColor: string;
  cardFrom: string;
  cardTo: string;
};

const CITIES: City[] = [
  { id: 'london',    name: 'LONDON',     subtitle: 'Royal Club',      entry: 500,    prize: 1_000,  online: 8_420,  accentColor: '#4CAF50', cardFrom: '#2B1A0A', cardTo: '#170D05' },
  { id: 'dubai',     name: 'DUBAI',      subtitle: 'Marina Elite',    entry: 1_000,  prize: 2_500,  online: 6_234,  accentColor: '#1A9ED4', cardFrom: '#0A1E2E', cardTo: '#060F18' },
  { id: 'singapore', name: 'SINGAPORE',  subtitle: 'Marina Bay',      entry: 2_000,  prize: 5_000,  online: 4_560,  accentColor: '#0E9ABF', cardFrom: '#061A22', cardTo: '#030D12' },
  { id: 'tokyo',     name: 'TOKYO',      subtitle: 'Sakura Grand',    entry: 3_000,  prize: 8_000,  online: 3_120,  accentColor: '#E05080', cardFrom: '#2A0818', cardTo: '#15040C' },
  { id: 'paris',     name: 'PARIS',      subtitle: 'Eiffel Elite',    entry: 5_000,  prize: 12_000, online: 2_870,  accentColor: '#9C6FD4', cardFrom: '#180A2A', cardTo: '#0C0515' },
  { id: 'istanbul',  name: 'ISTANBUL',   subtitle: 'Bosphorus Club',  entry: 750,    prize: 1_800,  online: 7_890,  accentColor: '#D4884A', cardFrom: '#2A1508', cardTo: '#150A04' },
  { id: 'rome',      name: 'ROME',       subtitle: 'Colosseum VIP',   entry: 7_500,  prize: 20_000, online: 1_840,  accentColor: '#D44A1A', cardFrom: '#2A0E08', cardTo: '#150704' },
  { id: 'berlin',    name: 'BERLIN',     subtitle: 'Brandenburg',     entry: 10_000, prize: 30_000, online: 980,    accentColor: '#4A9ED4', cardFrom: '#0A1C2A', cardTo: '#050E15' },
  { id: 'newdelhi',  name: 'NEW DELHI',  subtitle: 'Imperial Club',   entry: 250,    prize: 600,    online: 12_560, accentColor: '#E06030', cardFrom: '#2A1005', cardTo: '#150802' },
  { id: 'doha',      name: 'DOHA',       subtitle: 'Gulf Premier',    entry: 1_500,  prize: 4_000,  online: 5_100,  accentColor: '#D4AF37', cardFrom: '#2A1F08', cardTo: '#150F04' },
];

const TOKEN_IMGS: ImageSourcePropType[] = [
  Images.tokenRed, Images.tokenBlue, Images.tokenGreen, Images.tokenYellow,
];

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

// ─── Individual card — isolated component so useAnimatedStyle hooks are stable ───
function CityCard({
  city,
  index,
  scrollX,
  onPress,
}: {
  city: City;
  index: number;
  scrollX: ReturnType<typeof useSharedValue<number>>;
  onPress: () => void;
}) {
  const cardStyle = useAnimatedStyle(() => {
    const offset = index * (CARD_W + CARD_GAP);
    const dist = Math.abs(scrollX.value - offset);
    const scale = interpolate(dist, [0, CARD_W + CARD_GAP], [1, 0.82], Extrapolation.CLAMP);
    const translateY = interpolate(dist, [0, CARD_W + CARD_GAP], [0, 30], Extrapolation.CLAMP);
    const opacity = interpolate(dist, [0, CARD_W], [1, 0.55], Extrapolation.CLAMP);
    return { transform: [{ scale }, { translateY }], opacity };
  });

  return (
    <Pressable onPress={onPress} style={{ width: CARD_W, marginHorizontal: CARD_GAP / 2 }}>
      <Animated.View style={[styles.cardWrapper, cardStyle]}>
        {/* Outer gold glow */}
        <View style={styles.cardGlowRing}>
          {/* Gold border 1 */}
          <View style={styles.cardBorder1}>
            {/* Gap */}
            <View style={styles.cardGap}>
              {/* Gold border 2 (inner) */}
              <View style={styles.cardBorder2}>
                {/* Body */}
                <LinearGradient
                  colors={[city.cardFrom, city.cardTo, city.cardTo]}
                  locations={[0, 0.5, 1]}
                  style={styles.cardBody}
                >
                  {/* Top gold line accent */}
                  <LinearGradient
                    colors={['transparent', colors.gold, 'transparent']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.topAccentLine}
                  />

                  {/* Crown */}
                  <View style={styles.crownWrap}>
                    <Image source={Images.crown} style={styles.crownImg} resizeMode="contain" />
                  </View>

                  {/* City name */}
                  <Text style={styles.cityName}>{city.name}</Text>
                  <Text style={styles.citySubtitle}>{city.subtitle}</Text>

                  {/* Ornamental divider */}
                  <View style={styles.ornaDivider}>
                    <View style={styles.ornaLine} />
                    <Ionicons name="diamond" size={8} color={colors.goldDark} />
                    <View style={styles.ornaLine} />
                  </View>

                  {/* Entry / Prize */}
                  <View style={styles.statsRow}>
                    <View style={styles.statBlock}>
                      <Text style={styles.statLabel}>ENTRY FEE</Text>
                      <View style={styles.statValueRow}>
                        <Image source={Images.coinSingle} style={styles.statCoin} />
                        <Text style={styles.statValue}>{fmt(city.entry)}</Text>
                      </View>
                    </View>
                    <View style={styles.statVDivider} />
                    <View style={styles.statBlock}>
                      <Text style={styles.statLabel}>PRIZE POOL</Text>
                      <View style={styles.statValueRow}>
                        <Ionicons name="trophy" size={14} color={colors.goldLight} />
                        <Text style={[styles.statValue, { color: colors.goldLight }]}>{fmt(city.prize)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Online */}
                  <View style={styles.onlineRow}>
                    <View style={[styles.onlineDot, { backgroundColor: city.accentColor }]} />
                    <Text style={[styles.onlineText, { color: city.accentColor }]}>
                      {fmt(city.online)} players online
                    </Text>
                  </View>

                  {/* Ornamental divider */}
                  <View style={styles.ornaDivider}>
                    <View style={styles.ornaLine} />
                    <Ionicons name="diamond" size={8} color={colors.goldDark} />
                    <View style={styles.ornaLine} />
                  </View>

                  {/* Token icons */}
                  <View style={styles.tokensRow}>
                    {TOKEN_IMGS.map((src, i) => (
                      <Image key={i} source={src} style={styles.tokenImg} resizeMode="contain" />
                    ))}
                  </View>
                </LinearGradient>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Main screen ───
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const coins = useWalletStore((s) => s.coins);
  const hydrated = useWalletStore((s) => s.hydrated);
  const hydrate = useWalletStore((s) => s.hydrate);
  const claimDaily = useWalletStore((s) => s.claimDaily);
  const pendingClaim = useWalletStore((s) => s.pendingClaim);

  const [activeIdx, setActiveIdx] = useState(0);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [pendingDay, setPendingDay] = useState(1);

  const scrollX = useSharedValue(0);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!hydrated || rewardOpen) return;
    const p = pendingClaim();
    if (p) { setPendingDay(p.day); setRewardOpen(true); }
  }, [hydrated, pendingClaim, rewardOpen]);

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const onMomentumEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + CARD_GAP));
    setActiveIdx(Math.max(0, Math.min(idx, CITIES.length - 1)));
  };

  const onPlay = useCallback(() => {
    haptics.tap();
    router.push('/game/matchmaking');
  }, [router]);

  const onVsAI = useCallback(() => {
    haptics.tap();
    router.push('/game/new');
  }, [router]);

  const renderItem = useCallback(({ item, index }: { item: City; index: number }) => (
    <CityCard
      city={item}
      index={index}
      scrollX={scrollX}
      onPress={onPlay}
    />
  ), [scrollX, onPlay]);

  const activeCity = CITIES[activeIdx];

  return (
    <View style={styles.root}>
      {/* Dark textured background */}
      <ImageBackground source={Images.bgHome} style={StyleSheet.absoluteFill} resizeMode="cover">
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(6,4,2,0.82)' }]} />
      </ImageBackground>

      {/* Ambient spotlight glow behind active card */}
      <View
        style={[
          styles.spotlight,
          { backgroundColor: activeCity.accentColor + '18' },
        ]}
      />

      {/* ── Header ── */}
      <Animated.View
        entering={FadeIn.duration(500)}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <Pressable
          onPress={() => { haptics.tap(); router.push('/settings'); }}
          style={styles.headerIconBtn}
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={19} color={colors.gold} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerLogo}>ELITE LUDO</Text>
          <Text style={styles.headerSub}>2026 EDITION</Text>
        </View>

        <Pressable style={styles.coinBadge}>
          <Image source={Images.coinSingle} style={styles.coinIcon} />
          <Text style={styles.coinText}>{fmt(coins)}</Text>
        </Pressable>
      </Animated.View>

      {/* ── 3D Card Carousel ── */}
      <Animated.FlatList
        data={CITIES}
        renderItem={renderItem}
        keyExtractor={(c) => c.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SIDE_INSET - CARD_GAP / 2 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, i) => ({
          length: CARD_W + CARD_GAP,
          offset: (CARD_W + CARD_GAP) * i,
          index: i,
        })}
        style={styles.carousel}
      />

      {/* ── Dot indicators ── */}
      <View style={styles.dotsRow}>
        {CITIES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIdx
                ? [styles.dotActive, { backgroundColor: activeCity.accentColor }]
                : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* ── Action area ── */}
      <View style={[styles.actionArea, { paddingBottom: insets.bottom + 80 }]}>
        {/* PLAY NOW */}
        <Pressable
          onPress={onPlay}
          style={({ pressed }) => [styles.playOuter, pressed && { opacity: 0.88 }]}
        >
          <LinearGradient
            colors={['#4DD666', '#27A040', '#1B7A30']}
            locations={[0, 0.5, 1]}
            style={styles.playGradient}
          >
            {/* Inner highlight line */}
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={styles.playHighlight}
            />
            <Text style={styles.playText}>PLAY NOW</Text>
            <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
          </LinearGradient>
        </Pressable>

        {/* vs AI row */}
        <Pressable onPress={onVsAI} style={styles.vsAiBtn} hitSlop={8}>
          <Ionicons name="desktop-outline" size={14} color={colors.textDim} />
          <Text style={styles.vsAiText}>Practice vs Computer</Text>
        </Pressable>
      </View>

      <DailyRewardModal
        visible={rewardOpen}
        pendingDay={pendingDay}
        onClaim={() => { const r = claimDaily(); if (r) haptics.success(); setRewardOpen(false); }}
        onClose={() => setRewardOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060402' },

  spotlight: {
    position: 'absolute',
    top: '25%',
    alignSelf: 'center',
    width: W * 0.9,
    height: W * 0.9,
    borderRadius: W * 0.45,
    transform: [{ scaleY: 0.45 }],
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerLogo: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 5,
    textShadowColor: 'rgba(212,175,55,0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  headerSub: {
    color: 'rgba(212,175,55,0.4)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: 1,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  coinIcon: { width: 18, height: 18, resizeMode: 'contain' },
  coinText: { color: colors.gold, fontWeight: '800', fontSize: 14 },

  // Carousel
  carousel: {
    flexGrow: 0,
    marginTop: 8,
  },

  // Card
  cardWrapper: {
    width: CARD_W,
    height: CARD_H + 10,
    alignItems: 'center',
    paddingTop: 10,
  },
  cardGlowRing: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    // Gold outer glow
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 16,
  },
  cardBorder1: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: 3,
    backgroundColor: '#0A0602',
  },
  cardGap: {
    flex: 1,
    borderRadius: 17,
    backgroundColor: '#0A0602',
  },
  cardBorder2: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#7A5A1A',
    overflow: 'hidden',
  },
  cardBody: {
    flex: 1,
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  topAccentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },

  // Crown
  crownWrap: { alignItems: 'center', marginTop: 4 },
  crownImg: { width: 64, height: 54 },

  // City info
  cityName: {
    color: colors.gold,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: 'rgba(212,175,55,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    textAlign: 'center',
  },
  citySubtitle: {
    color: 'rgba(212,175,55,0.55)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: -4,
  },

  // Ornamental divider
  ornaDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },
  ornaLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212,175,55,0.25)',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
    paddingVertical: 10,
  },
  statBlock: { flex: 1, alignItems: 'center', gap: 4 },
  statVDivider: { width: 1, height: 28, backgroundColor: 'rgba(212,175,55,0.2)' },
  statLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statCoin: { width: 14, height: 14, resizeMode: 'contain' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Online
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5 },
  onlineText: { fontSize: 12, fontWeight: '600' },

  // Tokens
  tokensRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  tokenImg: { width: 32, height: 32 },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 6,
  },
  dot: { borderRadius: 4 },
  dotActive: { width: 20, height: 6 },
  dotInactive: { width: 6, height: 6, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Action area
  actionArea: {
    paddingHorizontal: 22,
    gap: 10,
    marginTop: 4,
  },
  playOuter: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.6)',
    shadowColor: '#27A040',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  playGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 17,
    overflow: 'hidden',
  },
  playHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    borderRadius: 14,
  },
  playText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  vsAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  vsAiText: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '500',
  },
});
