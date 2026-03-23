<template>
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
          :ref="setCanvasRef"
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
        :current-group-point-count="activeGroupPointCount"
        :handle-clear="handleClear"
        :handle-draw="handleDraw"
        :handle-next-group="handleNextGroup"
        :handle-speed-change="handleSpeedChange"
        :speed="speed"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Tools from "./Tools.vue";

export default defineComponent({
  name: "WorkspaceSection",
  components: {
    Tools,
  },
  props: [
    "activeGroupPointCount",
    "canvasSize",
    "canDraw",
    "canNextGroup",
    "completedGroupCount",
    "currentGroupNumber",
    "handleClear",
    "handleDraw",
    "handleMouseDown",
    "handleNextGroup",
    "handleSpeedChange",
    "setCanvasRef",
    "speed",
  ],
});
</script>
