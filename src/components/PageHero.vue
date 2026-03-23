<template>
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
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PageHero",
  props: ["totalPointCount"],
});
</script>
