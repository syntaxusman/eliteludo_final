import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Images } from '@/src/assets';
import { colors } from '@/src/theme/colors';
import { fontFamilies } from '@/src/theme/typography';
import { haptics } from '@/src/utils/haptics';

const CLUBS = [
  { name: 'Royal Club', city: 'London', entry: '500', crown: Images.clubCrownRoyal },
  { name: 'Marina Elite', city: 'Dubai', entry: '1K', crown: Images.clubCrownRuby },
  { name: 'Sakura Grand', city: 'Tokyo', entry: '3K', crown: Images.clubCrownEmerald },
];

export default function ClubsScreen() {
  return (
    <ImageBackground source={Images.bgHome} style={styles.root} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View entering={FadeIn.duration(320)} style={styles.header}>
          <Text style={styles.title}>Clubs</Text>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={16} color={colors.gold} />
            <Text style={styles.badgeText}>Elite tables</Text>
          </View>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {CLUBS.map((club, index) => (
            <Animated.View key={club.name} entering={FadeInDown.delay(90 + index * 70).duration(340)}>
              <Pressable
                onPress={() => haptics.tap()}
                style={({ pressed }) => [styles.clubCard, pressed && { opacity: 0.78 }]}
              >
                <LinearGradient
                  colors={['rgba(212,175,55,0.18)', 'rgba(8,5,3,0.92)']}
                  style={StyleSheet.absoluteFill}
                />
                <Image source={club.crown} style={styles.crown} resizeMode="contain" />
                <View style={styles.clubCopy}>
                  <Text style={styles.clubName}>{club.name}</Text>
                  <Text style={styles.clubCity}>{club.city}</Text>
                </View>
                <View style={styles.entryPill}>
                  <Ionicons name="ellipse" size={12} color={colors.gold} />
                  <Text style={styles.entryText}>{club.entry}</Text>
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.66)' },
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
  clubCard: {
    minHeight: 104,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.28)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 14,
  },
  crown: { width: 62, height: 62 },
  clubCopy: { flex: 1 },
  clubName: { color: '#FFF6D0', fontFamily: fontFamilies.heading, fontSize: 17, fontWeight: '400' },
  clubCity: { color: 'rgba(255,255,255,0.54)', fontFamily: fontFamilies.body, fontSize: 12 },
  entryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  entryText: { color: '#FFF0AA', fontFamily: fontFamilies.heading, fontWeight: '400' },
});
