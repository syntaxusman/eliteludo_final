import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Images } from '@/src/assets';
import { colors } from '@/src/theme/colors';
import { fontFamilies } from '@/src/theme/typography';
import { haptics } from '@/src/utils/haptics';

const FRIEND_ACTIONS = [
  { title: 'Invite Friends', subtitle: 'Share your table code', icon: 'person-add' as const },
  { title: 'Online Friends', subtitle: 'No friends online yet', icon: 'radio' as const },
  { title: 'Requests', subtitle: 'Incoming invites appear here', icon: 'mail-unread' as const },
];

export default function FriendsScreen() {
  return (
    <ImageBackground source={Images.bgHome} style={styles.root} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View entering={FadeIn.duration(320)} style={styles.header}>
          <Text style={styles.title}>Friends</Text>
          <View style={styles.statusPill}>
            <Ionicons name="people" size={16} color={colors.gold} />
            <Text style={styles.statusText}>0 online</Text>
          </View>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {FRIEND_ACTIONS.map((item, index) => (
            <Animated.View key={item.title} entering={FadeInDown.delay(90 + index * 60).duration(320)}>
              <Pressable
                onPress={() => haptics.tap()}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.78 }]}
              >
                <LinearGradient
                  colors={['rgba(212,175,55,0.15)', 'rgba(12,8,4,0.88)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.iconPlate}>
                  <Ionicons name={item.icon} size={24} color="#FFF0AA" />
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSub}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,240,170,0.55)" />
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.68)' },
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
  statusPill: {
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
  statusText: { color: '#FFF0AA', fontFamily: fontFamilies.heading, fontSize: 12, fontWeight: '400' },
  scroll: { paddingHorizontal: 16, paddingBottom: 116, gap: 12 },
  card: {
    minHeight: 86,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.28)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  iconPlate: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,240,170,0.32)',
  },
  cardCopy: { flex: 1 },
  cardTitle: { color: '#FFF6D0', fontFamily: fontFamilies.heading, fontSize: 16, fontWeight: '400' },
  cardSub: { color: 'rgba(255,255,255,0.52)', fontFamily: fontFamilies.body, fontSize: 12 },
});
