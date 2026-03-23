import { Point, PointGroup } from "typings";
import { computed, CSSProperties, ref } from "vue";

import { CANVAS_COLORS, CANVAS_SIZE } from "../utils/canvasPalette";
import DrawHelper from "../utils/DrawHelper";
import { createPresetSmileGroups } from "../utils/presetSmile";

export const useBezierWorkspace = () => {
  const createInitialPointGroups = (): PointGroup[] => [
    ...createPresetSmileGroups(),
    [],
  ];

  const canvasElement = ref<HTMLCanvasElement | null>(null);
  const canvasSize = CANVAS_SIZE;
  const drawHelper = new DrawHelper();
  const pointGroups = ref<PointGroup[]>(createInitialPointGroups());
  const speed = ref(1);
  const themeVars = {
    "--legend-control": CANVAS_COLORS.control,
    "--legend-guide": CANVAS_COLORS.guide,
    "--legend-curve": CANVAS_COLORS.curve,
  } as CSSProperties;

  const activeGroup = computed(
    () => pointGroups.value[pointGroups.value.length - 1] ?? []
  );
  const currentGroupNumber = computed(() => pointGroups.value.length);
  const totalPointCount = computed(() =>
    pointGroups.value.reduce((total, group) => total + group.length, 0)
  );
  const completedGroupCount = computed(
    () => pointGroups.value.filter((group) => group.length >= 3).length
  );
  const hasIncompleteGroup = computed(() =>
    pointGroups.value.some((group) => group.length > 0 && group.length < 3)
  );
  const canNextGroup = computed(() => activeGroup.value.length >= 3);
  const canDraw = computed(
    () => completedGroupCount.value > 0 && !hasIncompleteGroup.value
  );

  const setCanvasRef = (element: HTMLCanvasElement | null) => {
    canvasElement.value = element;
  };

  const getCanvasPoint = (event: MouseEvent): Point | undefined => {
    const canvas = canvasElement.value;

    if (!canvas) return undefined;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const redrawGroups = () => {
    drawHelper.renderPointGroups(pointGroups.value);
  };

  const handleMouseDown = (event: MouseEvent) => {
    const point = getCanvasPoint(event);

    if (!point) return;

    activeGroup.value.push(point);
    redrawGroups();
  };

  const handleClear = () => {
    pointGroups.value = [[]];
    drawHelper.clear();
  };

  const handleDraw = () => {
    if (!canDraw.value) return;

    drawHelper.drawBezier(pointGroups.value, speed.value);
  };

  const handleNextGroup = () => {
    if (!canNextGroup.value) return;

    pointGroups.value.push([]);
    redrawGroups();
  };

  const handleSpeedChange = (nextSpeed: number) => {
    const clampedSpeed = Math.min(2, Math.max(0.1, nextSpeed));
    const normalizedSpeed = Number(clampedSpeed.toFixed(1));

    drawHelper.setSpeed(normalizedSpeed);

    if (speed.value === normalizedSpeed) return;

    speed.value = normalizedSpeed;
  };

  const initializeCanvas = () => {
    const canvas = canvasElement.value;

    if (!canvas) return;

    drawHelper.ctx = canvas.getContext("2d")!;
    drawHelper.setSpeed(speed.value);
    redrawGroups();
    handleDraw();
  };

  return {
    activeGroup,
    canDraw,
    canNextGroup,
    canvasSize,
    completedGroupCount,
    currentGroupNumber,
    handleClear,
    handleDraw,
    handleMouseDown,
    handleNextGroup,
    handleSpeedChange,
    initializeCanvas,
    setCanvasRef,
    speed,
    themeVars,
    totalPointCount,
  };
};
