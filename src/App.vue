<template>
  <div class="page-shell" :style="themeVars">
    <div ref="shellHeaderTarget" class="shell-slot"></div>

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

    <div ref="shellFooterTarget" class="shell-slot"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import "./assets/app-shell.css";

import PageHero from "./components/PageHero.vue";
import WorkspaceSection from "./components/WorkspaceSection.vue";
import { useBezierWorkspace } from "./composables/useBezierWorkspace";
import { useSiteShell } from "./composables/useSiteShell";

export default defineComponent({
  name: "App",
  components: {
    PageHero,
    WorkspaceSection,
  },
  setup() {
    const siteShell = useSiteShell({
      siteName: "Bezier Curve Visualizer",
      repoUrl: "https://github.com/navelorange1999/bezier-curve",
    });
    const bezierWorkspace = useBezierWorkspace();

    onMounted(() => {
      siteShell.mountShellSections();
      bezierWorkspace.initializeCanvas();
    });

    return {
      ...siteShell,
      ...bezierWorkspace,
    };
  },
});
</script>
