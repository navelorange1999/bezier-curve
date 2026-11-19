<template>
  <App>
    <template #header><div ref="shellHeaderTarget" class="shell-slot"></div></template>
    <template #footer><div ref="shellFooterTarget" class="shell-slot"></div></template>
  </App>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import App from "./App.vue";
import { useSiteShell } from "./composables/useSiteShell";

export default defineComponent({
  components: { App },
  setup() {
    const shell = useSiteShell({
      siteName: "Bezier Curve Visualizer",
      repoUrl: "https://github.com/navelorange1999/bezier-curve",
    });
    onMounted(shell.mountShellSections);
    return shell;
  },
});
</script>
