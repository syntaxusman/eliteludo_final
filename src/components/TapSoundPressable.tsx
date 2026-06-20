import { Pressable, PressableProps } from 'react-native';
import { sound } from '@/src/utils/sound';

export function TapSoundPressable({ onPress, disabled, ...props }: PressableProps) {
  const handlePress = (...args: any[]) => {
    if (!disabled) {
      sound.play('tap');
    }
    if (onPress) {
      (onPress as any)(...args);
    }
  };

  return <Pressable {...props} onPress={handlePress} disabled={disabled} />;
}
