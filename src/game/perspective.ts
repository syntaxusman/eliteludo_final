import { BOARD_SIZE, type Cell } from './board';
import type { Color } from './types';

export type VisualCorner = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft';

export const COLOR_HOME_CORNER: Record<Color, VisualCorner> = {
  red: 'topLeft',
  green: 'topRight',
  yellow: 'bottomRight',
  blue: 'bottomLeft',
};

const COLOR_TO_BOTTOM_LEFT_ROTATION: Record<Color, 0 | 90 | 180 | 270> = {
  blue: 0,
  yellow: 90,
  green: 180,
  red: 270,
};

export function cellForPerspective(cell: Cell, perspectiveColor: Color): Cell {
  const max = BOARD_SIZE - 1;
  switch (COLOR_TO_BOTTOM_LEFT_ROTATION[perspectiveColor]) {
    case 0:
      return cell;
    case 90:
      return { col: max - cell.row, row: cell.col };
    case 180:
      return { col: max - cell.col, row: max - cell.row };
    case 270:
      return { col: cell.row, row: max - cell.col };
  }
}

export function visualCornerForColor(
  color: Color,
  perspectiveColor: Color,
): VisualCorner {
  const probe = homeCornerProbe(color);
  const visual = cellForPerspective(probe, perspectiveColor);
  const half = BOARD_SIZE / 2;
  if (visual.col < half && visual.row < half) return 'topLeft';
  if (visual.col >= half && visual.row < half) return 'topRight';
  if (visual.col >= half && visual.row >= half) return 'bottomRight';
  return 'bottomLeft';
}

function homeCornerProbe(color: Color): Cell {
  switch (COLOR_HOME_CORNER[color]) {
    case 'topLeft':
      return { col: 0, row: 0 };
    case 'topRight':
      return { col: BOARD_SIZE - 1, row: 0 };
    case 'bottomRight':
      return { col: BOARD_SIZE - 1, row: BOARD_SIZE - 1 };
    case 'bottomLeft':
      return { col: 0, row: BOARD_SIZE - 1 };
  }
}
