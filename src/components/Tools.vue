<template>
  <aside class="toolbar">
    <section class="toolbar-section">
      <p class="toolbar-label">Current group</p>
      <strong class="toolbar-value">Group {{ currentGroup }}</strong>
      <p class="toolbar-meta">
        {{ currentGroupPointCount }} points in progress
      </p>
      <p class="toolbar-meta">
        {{ completedGroupCount }} completed groups
      </p>
    </section>

    <section class="toolbar-section">
      <label class="toolbar-label toolbar-label-row" for="speed-range">
        <span>Speed</span>
        <strong class="toolbar-value-inline">{{ speedLabel }}x</strong>
      </label>
      <input
        id="speed-range"
        class="toolbar-range"
        type="range"
        min="0.1"
        max="2"
        step="0.1"
        :value="localSpeed"
        @input="onSpeedInput"
      />
      <div class="toolbar-scale">
        <span>0.1x</span>
        <span>2.0x</span>
      </div>
    </section>

    <div class="toolbar-group">
      <button
        class="toolbar-button toolbar-button-secondary"
        :disabled="nextGroupDisabled"
        @click="handleNextGroup"
      >
        Next group
      </button>
      <button
        class="toolbar-button toolbar-button-primary"
        :disabled="drawDisabled"
        @click="handleDraw"
      >
        Start draw
      </button>
      <button class="toolbar-button toolbar-button-secondary" @click="handleClear">
        Clear
      </button>
    </div>

    <p v-show="nextGroupDisabled" class="toolbar-hint">
      {{ nextGroupHint }}
    </p>
    <p v-show="drawDisabled" class="toolbar-hint">
      Each non-empty group needs at least 3 points before drawing.
    </p>
  </aside>
</template>

<script lang="ts">
import { computed, defineComponent, ref, toRefs, watch } from "vue";

export default defineComponent({
  props: [
    "canDraw",
    "canNextGroup",
    "completedGroupCount",
    "currentGroup",
    "currentGroupPointCount",
    "handleClear",
    "handleDraw",
    "handleNextGroup",
    "handleSpeedChange",
    "speed",
  ],

  setup(props) {
    const propRefs = toRefs(props);
    const localSpeed = ref(Number(props.speed));
    const drawDisabled = computed(() => !props.canDraw);
    const nextGroupDisabled = computed(() => !props.canNextGroup);
    const speedLabel = computed(() => localSpeed.value.toFixed(1));
    const nextGroupHint = computed(() => {
      if (props.currentGroupPointCount === 0) {
        return "Add at least 3 points to the current group before creating another.";
      }

      return "Place at least 3 points before moving to the next group.";
    });

    watch(
      () => props.speed,
      (nextSpeed) => {
        localSpeed.value = Number(nextSpeed);
      }
    );

    const onSpeedInput = (e: Event) => {
      const nextSpeed = Number(
        (e.target as HTMLInputElement | null)?.value ?? props.speed
      );

      localSpeed.value = nextSpeed;
      props.handleSpeedChange(nextSpeed);
    };

    return {
      ...propRefs,
      drawDisabled,
      localSpeed,
      nextGroupDisabled,
      nextGroupHint,
      onSpeedInput,
      speedLabel,
    };
  },
});
</script>

<style scoped>
.toolbar {
  display: flex;
  flex: 0 0 240px;
  flex-direction: column;
  gap: 14px;
  width: 240px;
  padding: 16px;
  border: 1px solid var(--panel-border-soft);
  border-radius: 18px;
  background: var(--panel-bg-soft);
}

.toolbar-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toolbar-label {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--page-muted-strong);
}

.toolbar-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-value {
  font-size: 20px;
  line-height: 1.1;
  color: var(--page-text-strong);
}

.toolbar-value-inline {
  min-width: 3.2em;
  text-align: right;
  font-size: 16px;
  font-variant-numeric: tabular-nums;
  color: var(--page-text-strong);
}

.toolbar-meta {
  margin: 0;
  color: var(--page-muted);
  font-size: 14px;
  line-height: 1.4;
}

.toolbar-range {
  width: 100%;
  margin: 0;
  accent-color: var(--accent);
}

.toolbar-scale {
  display: flex;
  justify-content: space-between;
  color: var(--page-muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.toolbar-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toolbar-button {
  width: 100%;
  padding: 11px 18px;
  border: 1px solid transparent;
  border-radius: 12px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.toolbar-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.toolbar-button-primary {
  color: #fffef9;
  background: var(--accent);
}

.toolbar-button-primary:hover:not(:disabled) {
  background: var(--accent-strong);
}

.toolbar-button-secondary {
  color: var(--page-text);
  border-color: var(--secondary-border);
  background: var(--secondary-bg);
}

.toolbar-button-secondary:hover:not(:disabled) {
  background: var(--secondary-bg-hover);
}

.toolbar-button:disabled {
  color: #8a968f;
  background: #dde5dd;
  border-color: #dde5dd;
  cursor: not-allowed;
  transform: none;
}

.toolbar-hint {
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--hint-bg);
  color: var(--hint-text);
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .toolbar {
    width: 100%;
    flex: 1 1 auto;
  }
}
</style>
