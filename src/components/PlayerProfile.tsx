// Ornate in-match player plaque. The board screen is the place where the game
// needs to feel like a premium Ludo table, so this component leans into gold
// trim, leather tones, visible token stacks, and a compact last-roll die.

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { Images } from '@/src/assets';
import { tokensFinished } from '@/src/game/rules';
import type { Player } from '@/src/game/types';
import { Dice } from '@/src/skia/Dice';
import { colors } from '@/src/theme/colors';

const PLAYER_HEX: Record<string, string> = {
  red: colors.red,
  green: colors.green,
  yellow: colors.yellow,
  blue: colors.blue,
};

const TOKEN_IMAGE: Record<string, ImageSourcePropType> = {
  red: Images.tokenRed,
  green: Images.tokenGreen,
  yellow: Images.tokenYellow,
  blue: Images.tokenBlue,
};

type Props = {
  player: Player;
  isActive: boolean;
  /** Most-recent die rolled by this player, or null if they haven't rolled yet. */
  lastRoll: number | null;
  align: 'left' | 'right';
  dicePool?: number[];
  displayRoll?: number | null;
  isRolling?: boolean;
  canRoll?: boolean;
  onRoll?: () => void;
  timerProgress?: number | null;
  timerSeconds?: number | null;
};

export function PlayerProfile({
  player,
  isActive,
  lastRoll,
  align,
  dicePool = [],
  displayRoll = null,
  isRolling = false,
  canRoll = false,
  onRoll,
  timerProgress = null,
  timerSeconds = null,
}: Props) {
  const tint = PLAYER_HEX[player.color];
  const finished = tokensFinished(player);
  const showActiveDice = isActive;
  const smallDice = showActiveDice ? dicePool : [];
  const activeDieValue = displayRoll ?? dicePool[dicePool.length - 1] ?? lastRoll;

  return (
    <View
      style={[
        styles.card,
        align === 'right' && styles.alignRight,
        isActive && styles.cardActive,
      ]}
    >
      <LinearGradient
        colors={isActive ? ['#5A351C', '#241006'] : ['#2B1710', '#120806']}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.goldEdge, align === 'right' && styles.goldEdgeRight]} />

      <View style={[styles.avatarFrame, { borderColor: isActive ? colors.gold : '#7A5428' }]}>
        <LinearGradient colors={[tint, '#210B06']} style={styles.avatar}>
          <Text style={styles.avatarText}>{player.name.charAt(0)}</Text>
        </LinearGradient>
      </View>

      <View style={[styles.body, align === 'right' && styles.bodyRight]}>
        <Text style={styles.name} numberOfLines={1}>
          {player.name}
        </Text>
        <View style={[styles.tokenStack, align === 'right' && styles.tokenStackRight]}>
          {player.tokens.map((token) => (
            <View
              key={token.id}
              style={[
                styles.stackSlot,
                token.location.kind === 'finished' && styles.stackSlotFinished,
              ]}
            >
              <Image
                source={TOKEN_IMAGE[player.color]}
                style={styles.stackTokenGhost}
                resizeMode="contain"
              />
            </View>
          ))}
        </View>
        <Text style={[styles.meta, isActive && { color: colors.goldLight }]}>
          {finished}/4 home
        </Text>
      </View>

      {showActiveDice ? (
        <ActiveDice
          value={activeDieValue}
          smallDice={smallDice}
          rolling={isRolling}
          canRoll={canRoll}
          align={align}
          onRoll={onRoll}
          timerProgress={timerProgress}
          timerSeconds={timerSeconds}
        />
      ) : (
        <MiniDie value={lastRoll} faded={!isActive} tint={tint} />
      )}
      {isActive && (
        <View style={styles.activeCrown}>
          <Ionicons name="diamond" size={8} color={colors.bg} />
        </View>
      )}
    </View>
  );
}

function ActiveDice({
  value,
  smallDice,
  rolling,
  canRoll,
  align,
  onRoll,
  timerProgress,
  timerSeconds,
}: {
  value: number | null;
  smallDice: number[];
  rolling: boolean;
  canRoll: boolean;
  align: 'left' | 'right';
  onRoll?: () => void;
  timerProgress: number | null;
  timerSeconds: number | null;
}) {
  const showTimer = timerProgress !== null && timerSeconds !== null;
  return (
    <View style={[styles.activeDiceWrap, align === 'right' && styles.activeDiceRight]}>
      <View style={styles.diceLine}>
        <View style={styles.bigDie}>
          <Dice size={42} value={rolling ? null : value} rolling={rolling} />
        </View>
        {smallDice.length > 0 && (
          <View style={styles.smallDiceStack}>
            {smallDice.slice(0, 3).map((die, index) => (
              <View key={`${die}-${index}`} style={styles.poolDie}>
                <Text style={styles.poolDieText}>{die}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Pressable
        onPress={onRoll}
        disabled={!canRoll || rolling}
        style={({ pressed }) => [
          styles.rollButton,
          (!canRoll || rolling) && styles.rollButtonDisabled,
          pressed && canRoll && !rolling && { transform: [{ scale: 0.96 }] },
        ]}
      >
        <Text style={styles.rollButtonText}>{smallDice.length > 0 ? 'AGAIN' : 'ROLL'}</Text>
      </Pressable>
      {showTimer && (
        <View style={styles.timerTrack}>
          <View
            style={[
              styles.timerFill,
              { width: `${Math.max(0, Math.min(1, timerProgress)) * 100}%` },
            ]}
          />
          <Text style={styles.timerText}>{timerSeconds}s</Text>
        </View>
      )}
    </View>
  );
}

function MiniDie({
  value,
  faded,
  tint,
}: {
  value: number | null;
  faded: boolean;
  tint: string;
}) {
  return (
    <View
      style={[
        styles.die,
        { borderColor: faded ? '#62401F' : tint, opacity: faded ? 0.65 : 1 },
      ]}
    >
      <Text style={styles.dieText}>{value ?? '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 78,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7A5428',
    paddingVertical: 8,
    paddingHorizontal: 9,
    flex: 1,
    shadowColor: colors.gold,
    shadowOpacity: 0,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    overflow: 'hidden',
  },
  alignRight: { flexDirection: 'row-reverse' },
  cardActive: {
    borderColor: colors.gold,
    shadowOpacity: 0.5,
    elevation: 12,
  },
  goldEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.gold,
  },
  goldEdgeRight: {
    left: undefined,
    right: 0,
  },
  avatarFrame: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    padding: 2,
    backgroundColor: '#130802',
  },
  avatar: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontWeight: '900', fontSize: 16 },
  body: { flex: 1, gap: 3 },
  bodyRight: { alignItems: 'flex-end' },
  name: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tokenStack: {
    flexDirection: 'row',
    gap: 3,
  },
  tokenStackRight: {
    flexDirection: 'row-reverse',
  },
  stackSlot: {
    width: 13,
    height: 13,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackSlotFinished: {
    backgroundColor: 'rgba(212,175,55,0.28)',
    borderColor: colors.gold,
  },
  stackTokenGhost: {
    width: 10,
    height: 10,
    opacity: 0.65,
  },
  meta: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  die: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: '#F4D86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dieText: { color: '#190B02', fontWeight: '900', fontSize: 14 },
  activeDiceWrap: {
    width: 86,
    alignItems: 'center',
    gap: 4,
  },
  activeDiceRight: {
    alignItems: 'center',
  },
  diceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
  },
  bigDie: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#180904',
    borderWidth: 1.5,
    borderColor: colors.goldDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallDiceStack: {
    gap: 3,
    maxHeight: 48,
    justifyContent: 'center',
  },
  poolDie: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#5B2A16',
    backgroundColor: '#F5D96E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poolDieText: { color: '#190B02', fontWeight: '900', fontSize: 10 },
  rollButton: {
    minWidth: 58,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: '#2A1207',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  rollButtonDisabled: {
    opacity: 0.38,
  },
  rollButtonText: {
    color: '#FFF2B0',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  timerTrack: {
    width: 72,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.goldLight,
  },
  timerText: {
    position: 'absolute',
    right: 0,
    bottom: 3,
    color: colors.goldLight,
    fontSize: 8,
    fontWeight: '900',
  },
  activeCrown: {
    position: 'absolute',
    top: -1,
    alignSelf: 'center',
    width: 18,
    height: 14,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
