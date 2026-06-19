import {
  BackdropBlur,
  BlurMask,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  RadialGradient,
  RoundedRect,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const GOLD = '#D6A943';

export function LiquidGlassDock({
  width,
  height,
  activeIndex,
  itemCount,
}: {
  width: number;
  height: number;
  activeIndex: number;
  itemCount: number;
}) {
  const selected = useSharedValue(activeIndex);
  const liquid = useSharedValue(0);
  const segment = width / itemCount;
  const glassY = 7;
  const glassHeight = height - 9;
  const radius = Math.min(30, glassHeight / 2);
  const clip = useMemo(
    () => Skia.RRectXY(Skia.XYWHRect(1, glassY, width - 2, glassHeight), radius, radius),
    [glassHeight, radius, width],
  );

  useEffect(() => {
    selected.value = withSpring(activeIndex, {
      damping: 17,
      stiffness: 175,
      mass: 0.72,
    });
  }, [activeIndex, selected]);

  useEffect(() => {
    liquid.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [liquid]);

  const lensTransform = useDerivedValue(() => [
    { translateX: segment * (selected.value + 0.5) },
    { translateY: glassY + glassHeight * 0.47 },
  ]);

  const liquidTransform = useDerivedValue(() => [
    { scaleX: 1 + liquid.value * 0.055 },
    { scaleY: 1 - liquid.value * 0.035 },
  ]);

  return (
    <Canvas style={{ width, height }} pointerEvents="none">
      <RoundedRect
        x={8}
        y={height - 7}
        width={width - 16}
        height={5}
        r={2.5}
        color="#000000"
        opacity={0.62}
      >
        <BlurMask blur={9} style="normal" />
      </RoundedRect>

      <BackdropBlur blur={18} clip={clip}>
        <RoundedRect x={1} y={glassY} width={width - 2} height={glassHeight} r={radius}>
          <LinearGradient
            start={vec(0, glassY)}
            end={vec(width, height)}
            colors={[
              'rgba(56,48,34,0.64)',
              'rgba(13,13,13,0.78)',
              'rgba(3,3,3,0.9)',
            ]}
            positions={[0, 0.48, 1]}
          />
        </RoundedRect>
      </BackdropBlur>

      <RoundedRect
        x={1.5}
        y={glassY + 0.5}
        width={width - 3}
        height={glassHeight - 1}
        r={radius}
        style="stroke"
        strokeWidth={2}
      >
        <LinearGradient
          start={vec(0, glassY + glassHeight * 0.2)}
          end={vec(width, glassY + glassHeight * 0.8)}
          colors={[
            '#8A570E',
            '#FBE490',
            '#C98E22',
            '#FFF1A8',
            '#7B4808',
          ]}
          positions={[0, 0.22, 0.5, 0.73, 1]}
        />
      </RoundedRect>

      <Circle cx={width * 0.13} cy={glassY + 18} r={15} color="#FFF2B0" opacity={0.035}>
        <BlurMask blur={10} style="normal" />
      </Circle>
      <Circle cx={width * 0.83} cy={glassY + glassHeight * 0.72} r={22} color={GOLD} opacity={0.035}>
        <BlurMask blur={13} style="normal" />
      </Circle>

      <Group transform={lensTransform}>
        <Circle cx={0} cy={0} r={30} color={GOLD} opacity={0.2}>
          <BlurMask blur={14} style="normal" />
        </Circle>
        <Group transform={liquidTransform}>
          <RoundedRect x={-28} y={-25} width={56} height={50} r={24}>
            <RadialGradient
              c={vec(-11, -14)}
              r={49}
              colors={[
                'rgba(255,252,229,0.34)',
                'rgba(224,181,72,0.2)',
                'rgba(70,47,13,0.1)',
              ]}
            />
          </RoundedRect>
          <RoundedRect
            x={-28}
            y={-25}
            width={56}
            height={50}
            r={24}
            style="stroke"
            strokeWidth={1.3}
            color="#F8DC7D"
            opacity={0.5}
          />
        </Group>
      </Group>
    </Canvas>
  );
}
