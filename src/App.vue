<template>
  <div class="page-shell" :style="themeVars">
    <slot name="header" />

    <main class="page-main">
      <div class="container">
        <PageHero :total-point-count="totalPointCount" />
        <WorkspaceSection
          :active-group-point-count="activeGroup.length"
          :canvas-size="canvasSize"
          :can-draw="canDraw"
          :can-next-group="canNextGroup"
          :completed-group-count="completedGroupCount"
          :current-group-number="currentGroupNumber"
          :handle-clear="handleClear"
          :handle-draw="handleDraw"
          :handle-mouse-down="handleMouseDown"
          :handle-next-group="handleNextGroup"
          :handle-speed-change="handleSpeedChange"
          :set-canvas-ref="setCanvasRef"
          :speed="speed"
        />
      </div>
    </main>

    <slot name="footer" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import "./assets/app-shell.css";

import PageHero from "./components/PageHero.vue";
import WorkspaceSection from "./components/WorkspaceSection.vue";
import { useBezierWorkspace } from "./composables/useBezierWorkspace";

export default defineComponent({
  name: "App",
  components: {
    PageHero,
    WorkspaceSection,
  },
  setup() {
    const bezierWorkspace = useBezierWorkspace();

    onMounted(bezierWorkspace.initializeCanvas);
    return bezierWorkspace;
  },
});
</script>
