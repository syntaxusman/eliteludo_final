import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Path,
  RadialGradient,
  Skia,
  vec,
} from "@shopify/react-native-skia";

import type { Color } from "@/src/game/types";

type Palette = {
  base: string;
  light: string;
  dark: string;
  jewel: string;
};

const PALETTES: Record<Color, Palette> = {
  red: { base: "#A8173E", light: "#F05A78", dark: "#50091D", jewel: "#D92B54" },
  blue: {
    base: "#1269B4",
    light: "#55B7F2",
    dark: "#07335F",
    jewel: "#168EE0",
  },
  green: {
    base: "#087A49",
    light: "#43C980",
    dark: "#034329",
    jewel: "#0DAE68",
  },
  yellow: {
    base: "#BC8509",
    light: "#F4D34D",
    dark: "#664006",
    jewel: "#E6AD17",
  },
};

const GOLD = "#D6A943";
const GOLD_LIGHT = "#FFF0A0";
const GOLD_DARK = "#71430B";

export function OrnateTokenCanvas({
  size,
  color,
}: {
  size: number;
  color: Color;
}) {
  return (
    <Canvas style={{ width: size, height: size }} pointerEvents="none">
      <OrnateTokenGlyph
        cx={size / 2}
        cy={size / 2}
        size={size * 0.94}
        color={color}
      />
    </Canvas>
  );
}

export function OrnateTokenGlyph({
  cx,
  cy,
  size,
  color,
}: {
  cx: number;
  cy: number;
  size: number;
  color: Color;
}) {
  const palette = PALETTES[color];
  const r = size / 2;
  const flourish = flourishPath(cx, cy, size);
  const diamond = diamondPath(cx, cy, size * 0.2);

  return (
    <Group>
      <Circle
        cx={cx + size * 0.035}
        cy={cy + size * 0.075}
        r={r * 0.93}
        color="#000000"
        opacity={0.68}
      >
        <BlurMask blur={size * 0.07} style="normal" />
      </Circle>

      {/* Coin thickness and metallic outer rim. */}
      <Circle cx={cx} cy={cy + size * 0.045} r={r * 0.96} color={GOLD_DARK} />
      <Circle cx={cx} cy={cy} r={r * 0.96}>
        <LinearGradient
          start={vec(cx - r, cy - r)}
          end={vec(cx + r, cy + r)}
          colors={[GOLD_LIGHT, GOLD, "#9B6010", "#F5D46C"]}
        />
      </Circle>
      <Circle cx={cx} cy={cy} r={r * 0.86} color={palette.base}>
        <RadialGradient
          c={vec(cx - r * 0.28, cy - r * 0.34)}
          r={r * 1.15}
          colors={[palette.light, palette.base, palette.dark]}
        />
      </Circle>

      {/* Concentric engraved bands. */}
      <Circle
        cx={cx}
        cy={cy}
        r={r * 0.79}
        color={GOLD_LIGHT}
        style="stroke"
        strokeWidth={size * 0.035}
      />
      <Circle
        cx={cx}
        cy={cy}
        r={r * 0.69}
        color={GOLD}
        style="stroke"
        strokeWidth={size * 0.025}
      />
      <Circle
        cx={cx}
        cy={cy}
        r={r * 0.48}
        color={GOLD_DARK}
        style="stroke"
        strokeWidth={size * 0.018}
        opacity={0.75}
      />

      {/* Four mirrored royal flourishes. */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rotation) => (
        <Group
          key={rotation}
          origin={vec(cx, cy)}
          transform={[{ rotate: rotation }]}
        >
          <Path
            path={flourish}
            color={GOLD_LIGHT}
            style="stroke"
            strokeWidth={size * 0.038}
          />
          <Circle cx={cx} cy={cy - r * 0.66} r={size * 0.035} color={GOLD} />
          <Path
            path={smallLeafPath(cx, cy - r * 0.55, size * 0.09)}
            color={GOLD}
          />
        </Group>
      ))}

      {/* Faceted center jewel. */}
      <Path path={diamond} color={GOLD_DARK} />
      <Path
        path={diamondPath(cx, cy - size * 0.012, size * 0.165)}
        color={GOLD_LIGHT}
      />
      <Path
        path={diamondPath(cx, cy - size * 0.012, size * 0.13)}
        color={palette.jewel}
      >
        <LinearGradient
          start={vec(cx - size * 0.12, cy - size * 0.13)}
          end={vec(cx + size * 0.12, cy + size * 0.13)}
          colors={[palette.light, palette.jewel, palette.dark]}
        />
      </Path>
      <Path
        path={facetPath(cx, cy - size * 0.012, size * 0.13, "left")}
        color="#FFFFFF"
        opacity={0.2}
      />
      <Path
        path={facetPath(cx, cy - size * 0.012, size * 0.13, "right")}
        color={palette.dark}
        opacity={0.5}
      />

      <Circle
        cx={cx - r * 0.38}
        cy={cy - r * 0.48}
        r={size * 0.035}
        color="#FFFFFF"
        opacity={0.55}
      >
        <BlurMask blur={size * 0.025} style="normal" />
      </Circle>
    </Group>
  );
}

function flourishPath(cx: number, cy: number, size: number) {
  const r = size / 2;
  const path = Skia.Path.Make();
  path.moveTo(cx, cy - r * 0.18);
  path.cubicTo(
    cx - r * 0.12,
    cy - r * 0.31,
    cx - r * 0.31,
    cy - r * 0.3,
    cx - r * 0.34,
    cy - r * 0.43,
  );
  path.cubicTo(
    cx - r * 0.37,
    cy - r * 0.57,
    cx - r * 0.18,
    cy - r * 0.58,
    cx - r * 0.17,
    cy - r * 0.47,
  );
  path.cubicTo(
    cx - r * 0.16,
    cy - r * 0.38,
    cx - r * 0.28,
    cy - r * 0.36,
    cx - r * 0.29,
    cy - r * 0.44,
  );
  path.moveTo(cx, cy - r * 0.2);
  path.cubicTo(
    cx + r * 0.12,
    cy - r * 0.31,
    cx + r * 0.31,
    cy - r * 0.3,
    cx + r * 0.34,
    cy - r * 0.43,
  );
  path.cubicTo(
    cx + r * 0.37,
    cy - r * 0.57,
    cx + r * 0.18,
    cy - r * 0.58,
    cx + r * 0.17,
    cy - r * 0.47,
  );
  return path;
}

function smallLeafPath(cx: number, cy: number, size: number) {
  const path = Skia.Path.Make();
  path.moveTo(cx, cy - size);
  path.cubicTo(
    cx - size * 0.8,
    cy - size * 0.2,
    cx - size * 0.5,
    cy + size * 0.5,
    cx,
    cy + size,
  );
  path.cubicTo(
    cx + size * 0.5,
    cy + size * 0.5,
    cx + size * 0.8,
    cy - size * 0.2,
    cx,
    cy - size,
  );
  path.close();
  return path;
}

function diamondPath(cx: number, cy: number, size: number) {
  const path = Skia.Path.Make();
  path.moveTo(cx, cy - size);
  path.lineTo(cx + size * 0.72, cy);
  path.lineTo(cx, cy + size);
  path.lineTo(cx - size * 0.72, cy);
  path.close();
  return path;
}

function facetPath(
  cx: number,
  cy: number,
  size: number,
  side: "left" | "right",
) {
  const path = Skia.Path.Make();
  path.moveTo(cx, cy - size);
  path.lineTo(side === "left" ? cx - size * 0.72 : cx + size * 0.72, cy);
  path.lineTo(cx, cy + size);
  path.close();
  return path;
}
