<template>
  <div class="page-shell" :style="themeVars">
    <main class="container">
      <header class="hero">
        <div class="hero-copy">
          <p class="hero-kicker">Canvas Playground</p>
          <h1>Bezier Curve Visualizer</h1>
          <p class="hero-description">
            Place control points on the canvas and watch the curve emerge through
            recursive interpolation.
          </p>
        </div>
        <div class="hero-status">
          <span class="status-label">Total Points</span>
          <strong class="status-value">{{ totalPointCount }}</strong>
        </div>
      </header>

      <section class="workspace">
        <div class="workspace-heading">
          <div>
            <h2>Drawing Board</h2>
            <p>Use at least 3 points per group, then move to the next group.</p>
          </div>
          <ul class="legend">
            <li>
              <span class="legend-swatch legend-control"></span>
              Control point
            </li>
            <li>
              <span class="legend-swatch legend-guide"></span>
              Guide layer
            </li>
            <li>
              <span class="legend-swatch legend-curve"></span>
              Curve path
            </li>
          </ul>
        </div>

        <div class="workspace-body">
            <div class="canvas-stage">
              <canvas
                ref="cvs"
                :width="canvasSize.width"
                :height="canvasSize.height"
                class="my-canvas"
                @mousedown="handleMouseDown"
              ></canvas>
            </div>

          <Tools
            :can-draw="canDraw"
            :can-next-group="canNextGroup"
            :completed-group-count="completedGroupCount"
            :current-group="currentGroupNumber"
            :current-group-point-count="activeGroup.length"
            :handle-clear="handleClear"
            :handle-draw="handleDraw"
            :handle-next-group="handleNextGroup"
            :handle-speed-change="handleSpeedChange"
            :speed="speed"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { Point, PointGroup } from "typings";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import Tools from "./components/Tools.vue";
import { CANVAS_COLORS, CANVAS_SIZE } from "./utils/canvasPalette";
import DrawHelper from "./utils/DrawHelper";

export default defineComponent({
  name: "App",
  components: {
    Tools,
  },
  setup() {
    const cvs = ref<HTMLCanvasElement>();
    const canvasSize = CANVAS_SIZE;
    const drawHelper = reactive<DrawHelper>(
      new DrawHelper(cvs.value?.getContext("2d") ?? undefined)
    );
    const pointGroups = ref<PointGroup[]>([[]]);
    const speed = ref(1);
    const themeVars = {
      "--legend-control": CANVAS_COLORS.control,
      "--legend-guide": CANVAS_COLORS.guide,
      "--legend-curve": CANVAS_COLORS.curve,
    };

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
      pointGroups.value.some(
        (group) => group.length > 0 && group.length < 3
      )
    );
    const canNextGroup = computed(() => activeGroup.value.length >= 3);
    const canDraw = computed(
      () => completedGroupCount.value > 0 && !hasIncompleteGroup.value
    );

    const getCanvasPoint = (e: MouseEvent): Point | undefined => {
      const canvas = cvs.value;

      if (!canvas) return undefined;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const redrawGroups = () => {
      drawHelper.renderPointGroups(pointGroups.value);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const point = getCanvasPoint(e);

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

    onMounted(() => {
      if (!cvs.value) return;

      drawHelper.ctx = cvs.value.getContext("2d")!;
      drawHelper.setSpeed(speed.value);
      redrawGroups();
    });

    return {
      activeGroup,
      canDraw,
      canNextGroup,
      canvasSize,
      completedGroupCount,
      currentGroupNumber,
      cvs,
      handleClear,
      handleDraw,
      handleMouseDown,
      handleNextGroup,
      handleSpeedChange,
      speed,
      themeVars,
      totalPointCount,
    };
  },
});
</script>

<style>
:root {
  --page-text: #42514b;
  --page-text-strong: #2f4038;
  --page-text-soft: #65756e;
  --page-muted: #73827a;
  --page-muted-strong: #799082;
  --page-card-border: rgba(138, 159, 148, 0.22);
  --page-card-shadow: rgba(103, 121, 112, 0.12);
  --page-card-bg: rgba(252, 251, 247, 0.88);
  --panel-bg: #fcfcf8;
  --panel-bg-soft: #f1f5ef;
  --panel-border: #e2e7e0;
  --panel-border-soft: #dbe3db;
  --canvas-border: #cfd9d1;
  --canvas-frame-border: #e5ebe4;
  --canvas-bg: #fffdfa;
  --accent: #87a08d;
  --accent-strong: #748f7b;
  --accent-muted: #7b9285;
  --secondary-bg: #eef3ec;
  --secondary-border: #d8e2d8;
  --secondary-bg-hover: #e4ece3;
  --hint-bg: #f3ede4;
  --hint-text: #866d58;
}

html,
body,
#app {
  min-height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Avenir Next", "PingFang SC", "Noto Sans SC", sans-serif;
  color: var(--page-text);
  background:
    radial-gradient(circle at top left, rgba(184, 204, 190, 0.3), transparent 32%),
    radial-gradient(circle at right center, rgba(232, 218, 205, 0.42), transparent 28%),
    linear-gradient(180deg, #f7f4ee 0%, #eef3ed 100%);
}

* {
  box-sizing: border-box;
}

.page-shell {
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(14px, 2.8vw, 28px) clamp(12px, 2vw, 20px);
}

.container {
  width: min(100%, 1080px);
  margin: 0 auto;
  padding: clamp(18px, 2.5vw, 28px);
  border: 1px solid var(--page-card-border);
  border-radius: clamp(22px, 3vw, 28px);
  background: var(--page-card-bg);
  box-shadow: 0 22px 60px var(--page-card-shadow);
  backdrop-filter: blur(6px);
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: clamp(18px, 2vw, 24px);
}

.hero-copy {
  max-width: 620px;
}

.hero-kicker {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent-muted);
}

.hero h1 {
  margin: 0;
  font-size: clamp(32px, 4vw, 44px);
  line-height: 1.05;
  color: var(--page-text-strong);
}

.hero-description {
  margin: 12px 0 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--page-text-soft);
}

.hero-status {
  min-width: 160px;
  padding: 16px 18px;
  border: 1px solid var(--panel-border-soft);
  border-radius: 20px;
  background: var(--panel-bg-soft);
  text-align: left;
}

.status-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--page-muted-strong);
}

.status-value {
  font-size: 32px;
  line-height: 1;
  color: var(--page-text);
}

.workspace {
  padding: clamp(16px, 2vw, 22px);
  border: 1px solid var(--panel-border);
  border-radius: 24px;
  background: var(--panel-bg);
}

.workspace-heading {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.workspace-heading > div {
  min-width: 0;
}

.workspace-heading h2 {
  margin: 0 0 8px;
  font-size: 22px;
  color: var(--page-text-strong);
}

.workspace-heading p {
  margin: 0;
  color: var(--page-muted);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
  justify-content: flex-end;
  flex: 1 1 280px;
  color: var(--page-muted);
  font-size: 14px;
}

.legend li {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.legend-swatch {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.legend-control {
  background: var(--legend-control);
}

.legend-guide {
  background: var(--legend-guide);
}

.legend-curve {
  background: var(--legend-curve);
}

.workspace-body {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}



.canvas-stage {
  width: 100%;
  aspect-ratio: 2 / 1;
}

.my-canvas {
  display: block;
  width: 100%;
  height: 100%;
  border: 1px solid var(--canvas-border);
  border-radius: 16px;
  background: var(--canvas-bg);
  cursor: crosshair;
}

@media (max-width: 900px) {
  .workspace-body {
    flex-direction: column;
  }

  .legend {
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .page-shell {
    padding: 16px 12px;
  }

  .container {
    padding: 18px;
    border-radius: 22px;
  }

  .hero,
  .workspace-heading {
    flex-direction: column;
  }

  .hero-status {
    min-width: 0;
    width: 100%;
  }

  .workspace {
    padding: 16px;
  }

  .legend {
    flex: 1 1 auto;
  }
}
</style>
