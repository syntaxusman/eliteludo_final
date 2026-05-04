import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { DailyRewardModal } from '@/src/components/DailyRewardModal';
import { Images } from '@/src/assets';
import { useWalletStore } from '@/src/stores/wallet';
import { colors } from '@/src/theme/colors';
import { haptics } from '@/src/utils/haptics';

const { width: W, height: H } = Dimensions.get('window');
const THUMB_W = 72;
const THUMB_H = 96;
const THUMB_GAP = 10;
const TAB_BAR_H = 64;

type City = {
  id: string;
  name: string;
  subtitle: string;
  entry: number;
  prize: number;
  online: number;
  bg: ImageSourcePropType;
  accentColor: string;
};

const CITIES: City[] = [
  { id: 'london',    name: 'London',    subtitle: 'Royal Club',      entry: 500,   prize: 1_000,  online: 8_420,  bg: Images.cityLondon,    accentColor: '#4CAF50' },
  { id: 'dubai',     name: 'Dubai',     subtitle: 'Marina Elite',    entry: 1_000, prize: 2_500,  online: 6_234,  bg: Images.cityDubai,     accentColor: '#1A9ED4' },
  { id: 'singapore', name: 'Singapore', subtitle: 'Marina Bay',      entry: 2_000, prize: 5_000,  online: 4_560,  bg: Images.citySingapore, accentColor: '#0E8ABF' },
  { id: 'tokyo',     name: 'Tokyo',     subtitle: 'Sakura Grand',    entry: 3_000, prize: 8_000,  online: 3_120,  bg: Images.cityTokyo,     accentColor: '#FF6B9D' },
  { id: 'paris',     name: 'Paris',     subtitle: 'Eiffel Elite',    entry: 5_000, prize: 12_000, online: 2_870,  bg: Images.cityParis,     accentColor: '#9C6FD4' },
  { id: 'istanbul',  name: 'Istanbul',  subtitle: 'Bosphorus Club',  entry: 750,   prize: 1_800,  online: 7_890,  bg: Images.cityIstanbul,  accentColor: '#D4884A' },
  { id: 'rome',      name: 'Rome',      subtitle: 'Colosseum VIP',   entry: 7_500, prize: 20_000, online: 1_840,  bg: Images.cityRome,      accentColor: '#D44A1A' },
  { id: 'berlin',    name: 'Berlin',    subtitle: 'Brandenburg',     entry: 10_000,prize: 30_000, online: 980,    bg: Images.cityBerlin,    accentColor: '#4A9ED4' },
  { id: 'newdelhi',  name: 'New Delhi', subtitle: 'Imperial Club',   entry: 250,   prize: 600,    online: 12_560, bg: Images.cityNewDelhi,  accentColor: '#D44A1A' },
  { id: 'doha',      name: 'Doha',      subtitle: 'Gulf Premier',    entry: 1_500, prize: 4_000,  online: 5_100,  bg: Images.cityDoha,      accentColor: '#D4AF37' },
];

function fmtCoins(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

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

  const pagerRef = useRef<FlatList>(null);
  const thumbRef = useRef<FlatList>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated || rewardOpen) return;
    const pending = pendingClaim();
    if (pending) { setPendingDay(pending.day); setRewardOpen(true); }
  }, [hydrated, pendingClaim, rewardOpen]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const idx = viewableItems[0].index ?? 0;
        setActiveIdx(idx);
        thumbRef.current?.scrollToIndex({
          index: idx,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }
  ).current;

  const jumpToCity = (idx: number) => {
    haptics.tap();
    pagerRef.current?.scrollToIndex({ index: idx, animated: true });
  };

  const onPlay = (city: City) => {
    haptics.tap();
    router.push('/game/matchmaking');
  };

  const onVsAI = () => {
    haptics.tap();
    router.push('/game/new');
  };

  const renderCity = ({ item: city, index }: { item: City; index: number }) => (
    <View style={{ width: W, height: H }}>
      <ImageBackground source={city.bg} style={StyleSheet.absoluteFill} resizeMode="cover">
        {/* Layered gradient: subtle top dark + heavy bottom fade */}
        <LinearGradient
          colors={['rgba(0,0,0,0.35)', 'transparent']}
          style={styles.gradTop}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.88)', '#000']}
          locations={[0, 0.45, 0.75, 1]}
          style={styles.gradBottom}
        />
      </ImageBackground>

      {/* City info pinned at bottom of this page */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={[styles.cityInfo, { paddingBottom: insets.bottom + TAB_BAR_H + THUMB_H + 28 }]}
      >
        {/* Online pill */}
        <View style={styles.onlinePill}>
          <View style={[styles.onlineDot, { backgroundColor: city.accentColor }]} />
          <Text style={styles.onlineText}>{fmtCoins(city.online)} online</Text>
        </View>

        {/* City name */}
        <Text style={styles.cityName}>{city.name.toUpperCase()}</Text>
        <Text style={styles.citySubtitle}>{city.subtitle}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Image source={Images.coinSingle} style={styles.statIcon} />
            <Text style={styles.statLabel}>Entry Fee</Text>
            <Text style={styles.statValue}>{fmtCoins(city.entry)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={18} color={colors.gold} />
            <Text style={styles.statLabel}>Prize Pool</Text>
            <Text style={[styles.statValue, { color: colors.goldLight }]}>{fmtCoins(city.prize)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="people" size={18} color={city.accentColor} />
            <Text style={styles.statLabel}>Players</Text>
            <Text style={[styles.statValue, { color: city.accentColor }]}>{fmtCoins(city.online)}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => onVsAI()}
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.75 }]}
          >
            <Ionicons name="desktop-outline" size={16} color={colors.textMuted} />
            <Text style={styles.secondaryBtnText}>vs AI</Text>
          </Pressable>

          <Pressable
            onPress={() => onPlay(city)}
            style={({ pressed }) => [styles.playBtnOuter, pressed && { opacity: 0.9 }]}
          >
            <LinearGradient
              colors={['#3EC55A', '#1F8C35']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.playBtnGradient}
            >
              <Text style={styles.playBtnText}>PLAY NOW</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );

  const renderThumb = ({ item: city, index }: { item: City; index: number }) => {
    const isActive = index === activeIdx;
    return (
      <Pressable onPress={() => jumpToCity(index)} style={styles.thumbWrap}>
        <ImageBackground
          source={city.bg}
          style={[styles.thumbImg, isActive && styles.thumbImgActive]}
          resizeMode="cover"
          imageStyle={{ borderRadius: 10 }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={StyleSheet.absoluteFill}
          />
          {isActive && (
            <View style={[styles.thumbActiveBorder, { borderColor: city.accentColor }]} />
          )}
          <Text style={styles.thumbName} numberOfLines={1}>{city.name}</Text>
        </ImageBackground>
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      {/* ── Full-screen city pager ── */}
      <FlatList
        ref={pagerRef}
        data={CITIES}
        renderItem={renderCity}
        keyExtractor={(c) => c.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
      />

      {/* ── Floating header ── */}
      <Animated.View
        entering={FadeIn.duration(500)}
        style={[styles.header, { top: insets.top + 10 }]}
        pointerEvents="box-none"
      >
        <Pressable
          style={styles.headerIconBtn}
          onPress={() => { haptics.tap(); router.push('/settings'); }}
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={20} color={colors.gold} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ELITE LUDO</Text>
        </View>

        <Pressable style={styles.coinBadge} hitSlop={4}>
          <Image source={Images.coinSingle} style={styles.coinIcon} />
          <Text style={styles.coinText}>{fmtCoins(coins)}</Text>
        </Pressable>
      </Animated.View>

      {/* ── City thumbnail strip ── */}
      <View
        style={[
          styles.thumbStrip,
          { bottom: insets.bottom + TAB_BAR_H + 12 },
        ]}
        pointerEvents="box-none"
      >
        <FlatList
          ref={thumbRef}
          data={CITIES}
          renderItem={renderThumb}
          keyExtractor={(c) => c.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbContent}
          getItemLayout={(_, i) => ({
            length: THUMB_W + THUMB_GAP,
            offset: (THUMB_W + THUMB_GAP) * i,
            index: i,
          })}
          onScrollToIndexFailed={() => {}}
        />
      </View>

      {/* ── Daily reward modal ── */}
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
  root: { flex: 1, backgroundColor: '#000' },

  // City page gradients
  gradTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 160,
  },
  gradBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: H * 0.65,
  },

  // City info
  cityInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    alignItems: 'flex-start',
    gap: 12,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  onlineText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  cityName: {
    fontSize: 44,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
    lineHeight: 48,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  citySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    marginTop: -6,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignSelf: 'stretch',
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statIcon: { width: 18, height: 18, resizeMode: 'contain' },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 10,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  secondaryBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  playBtnOuter: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(62,197,90,0.5)',
  },
  playBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // Header (floating)
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: 'rgba(212,175,55,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  coinIcon: { width: 18, height: 18, resizeMode: 'contain' },
  coinText: { color: colors.gold, fontWeight: '700', fontSize: 14 },

  // Thumbnail strip (floating)
  thumbStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: THUMB_H + 4,
    zIndex: 10,
  },
  thumbContent: {
    paddingHorizontal: 16,
    gap: THUMB_GAP,
    alignItems: 'center',
  },
  thumbWrap: {
    width: THUMB_W,
    height: THUMB_H,
  },
  thumbImg: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 6,
  },
  thumbImgActive: {
    transform: [{ scale: 1.07 }],
  },
  thumbActiveBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    borderWidth: 2,
  },
  thumbName: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
