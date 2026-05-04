export const Images = {
  // Backgrounds
  bgHome: require('../../assets/images/bg-homepage.png'),
  bgHomeAlt: require('../../assets/images/bg-homepage-2.png'),

  // Board
  boardMini: require('../../assets/images/board-mini.png'),
  board: require('../../assets/images/board.png'),

  // Logo
  logo: require('../../assets/images/logo-elite-ludo.png'),

  // Tokens
  tokenRed: require('../../assets/images/token-red.png'),
  tokenBlue: require('../../assets/images/token-blue.png'),
  tokenGreen: require('../../assets/images/token-green.png'),
  tokenYellow: require('../../assets/images/token-yellow.png'),

  // Dice sprite sheets (6 faces in a row, face index = value - 1)
  diceGold: require('../../assets/images/dice-gold.png'),
  diceBlack: require('../../assets/images/dice-black.png'),

  // UI chrome
  ornateFrame: require('../../assets/images/ornate-border-frame.png'),
  avatarFrame: require('../../assets/images/avatar-frame.png'),

  // Daily rewards
  giftBox: require('../../assets/images/gift-box.png'),
  dailyRewardsBanner: require('../../assets/images/daily-rewards-banner.png'),

  // Buttons (use as Image inside TouchableOpacity when needed)
  btnRollDice: require('../../assets/images/btn-roll-dice.png'),
  btnCollect: require('../../assets/images/btn-collect.png'),

  // Game outcome
  trophyGold: require('../../assets/images/trophy-gold.png'),
  bannerVictory: require('../../assets/images/banner-victory.png'),
  bannerDefeat: require('../../assets/images/banner-defeat.png'),

  // Icons
  crown: require('../../assets/images/crown.png'),
  coin: require('../../assets/images/coin.png'),
  coinSingle: require('../../assets/images/coin-single.png'),
} as const;
