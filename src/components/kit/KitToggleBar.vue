<script setup lang="ts">
const model = defineModel()
const { options, getOptionLabel = (_) => _ } = defineProps<{
  options: string[]
  getOptionLabel?: (option: string) => string
}>()
</script>
<template>
  <ul class="kit-toggle-bar">
    <li v-for="option in options" :key="option" class="kit-toggle-bar-item">
      <button
        :class="['kit-toggle-bar-button', { active: model === option }]"
        @click="model = option"
      >
        {{ getOptionLabel(option) }}
      </button>
    </li>
  </ul>
</template>

<style scoped>
.kit-toggle-bar {
  margin: 0;
  padding: 0;
  display: flex;

  list-style: none;
}
.kit-toggle-bar-item {
  margin: 0;
  padding: 0;
}

.kit-toggle-bar-button {
  padding: 10px var(--spacing-xl);
  box-sizing: border-box;

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);

  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}
.kit-toggle-bar-button:hover {
  background-color: var(--bg-secondary_hover);
}
.kit-toggle-bar-button.active {
  background-color: var(--bg-active);
}

.kit-toggle-bar-item:not(:first-child) .kit-toggle-bar-button {
  border-left: none;
}

.kit-toggle-bar-item:first-child .kit-toggle-bar-button {
  border-top-left-radius: var(--radius-md);
  border-bottom-left-radius: var(--radius-md);
}

.kit-toggle-bar-item:last-child .kit-toggle-bar-button {
  border-top-right-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
}
</style>
