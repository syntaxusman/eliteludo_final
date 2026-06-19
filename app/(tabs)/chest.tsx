import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Images } from '@/src/assets';
import { colors } from '@/src/theme/colors';
import { fontFamilies } from '@/src/theme/typography';
import { haptics } from '@/src/utils/haptics';

const CHESTS = [
  { title: 'Daily Chest', subtitle: 'Open after your next reward streak', badge: '1' },
  { title: 'Victory Chest', subtitle: 'Win matches to unlock prizes', badge: '3' },
  { title: 'Royal Chest', subtitle: 'Premium cosmetics and coin drops', badge: 'VIP' },
];

export default function ChestScreen() {
  return (
    <ImageBackground source={Images.bgHome} style={styles.root} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View entering={FadeIn.duration(320)} style={styles.header}>
          <Text style={styles.title}>Chest</Text>
          <View style={styles.badge}>
            <Ionicons name="gift" size={16} color={colors.gold} />
            <Text style={styles.badgeText}>Rewards</Text>
          </View>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(80).duration(340)} style={styles.heroChest}>
            <LinearGradient
              colors={['rgba(212,175,55,0.22)', 'rgba(8,5,3,0.94)']}
              style={StyleSheet.absoluteFill}
            />
            <Image source={Images.giftBox} style={styles.gift} resizeMode="contain" />
            <Text style={styles.heroTitle}>Reward Vault</Text>
            <Text style={styles.heroSub}>Chests you earn from play will appear here.</Text>
          </Animated.View>

          {CHESTS.map((chest, index) => (
            <Animated.View key={chest.title} entering={FadeInDown.delay(170 + index * 60).duration(320)}>
              <Pressable
                onPress={() => haptics.tap()}
                style={({ pressed }) => [styles.chestRow, pressed && { opacity: 0.78 }]}
              >
                <View style={styles.chestIcon}>
                  <Ionicons name="archive" size={24} color="#FFF0AA" />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.chestTitle}>{chest.title}</Text>
                  <Text style={styles.chestSub}>{chest.subtitle}</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{chest.badge}</Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.67)' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  title: {
    color: colors.gold,
    fontFamily: fontFamilies.heading,
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.36)',
    backgroundColor: 'rgba(0,0,0,0.42)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: { color: '#FFF0AA', fontFamily: fontFamilies.heading, fontSize: 12, fontWeight: '400' },
  scroll: { paddingHorizontal: 16, paddingBottom: 116, gap: 12 },
  heroChest: {
    minHeight: 190,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  gift: { width: 82, height: 82, marginBottom: 8 },
  heroTitle: { color: '#FFF6D0', fontFamily: fontFamilies.heading, fontSize: 21, fontWeight: '400' },
  heroSub: { color: 'rgba(255,255,255,0.56)', fontFamily: fontFamilies.body, fontSize: 12, textAlign: 'center' },
  chestRow: {
    minHeight: 82,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.24)',
    backgroundColor: 'rgba(255,255,255,0.035)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  chestIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,240,170,0.28)',
  },
  copy: { flex: 1 },
  chestTitle: { color: '#FFF6D0', fontFamily: fontFamilies.heading, fontSize: 16, fontWeight: '400' },
  chestSub: { color: 'rgba(255,255,255,0.5)', fontFamily: fontFamilies.body, fontSize: 12 },
  countBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7A152B',
    borderWidth: 1,
    borderColor: 'rgba(255,240,170,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countText: { color: '#FFF6D0', fontFamily: fontFamilies.heading, fontWeight: '400', fontSize: 12 },
});
