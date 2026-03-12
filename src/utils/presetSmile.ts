import { PointGroup } from "../typings";

const PRESET_SMILE_GROUPS: PointGroup[] = [
  [
    { x: 155, y: 215 },
    { x: 155, y: 70 },
    { x: 300, y: 70 },
  ],
  [
    { x: 300, y: 70 },
    { x: 445, y: 70 },
    { x: 445, y: 215 },
  ],
  [
    { x: 445, y: 215 },
    { x: 445, y: 360 },
    { x: 300, y: 360 },
  ],
  [
    { x: 300, y: 360 },
    { x: 155, y: 360 },
    { x: 155, y: 215 },
  ],
  [
    { x: 225, y: 170 },
    { x: 250, y: 140 },
    { x: 275, y: 170 },
  ],
  [
    { x: 325, y: 170 },
    { x: 350, y: 140 },
    { x: 375, y: 170 },
  ],
  [
    { x: 220, y: 255 },
    { x: 255, y: 340 },
    { x: 300, y: 330 },
  ],
  [
    { x: 300, y: 330 },
    { x: 345, y: 340 },
    { x: 380, y: 255 },
  ],
];

export const createPresetSmileGroups = (): PointGroup[] =>
  PRESET_SMILE_GROUPS.map((group) => group.map((point) => ({ ...point })));
