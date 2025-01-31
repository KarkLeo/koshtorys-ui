<script setup lang="ts">
import { ref } from 'vue'

const value = ref<boolean>(false)
</script>

<template>
  <label :class="['toggle', { active: value }]">
    <input class="toggle-input" v-model="value" type="checkbox" />
    <span class="toggle-base" />
    <span class="toggle-switch" />
    <span class="toggle-outline" />
  </label>
</template>

<style scoped>
.toggle {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  cursor: pointer;
}

.toggle-input {
  opacity: 0;
}

.toggle-input:focus ~ .toggle-outline {
  opacity: 1;
}

.toggle-base {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  background-color: var(--bg-tertiary);
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
}

.toggle-switch {
  position: absolute;
  top: 2px;
  left: 2px;

  width: 16px;
  height: 16px;

  background-color: var(--fg-white);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
}

.toggle-outline {
  position: absolute;
  top: -4px;
  left: -4px;

  width: calc(100% + 8px);
  height: calc(100% + 8px);
  box-sizing: border-box;

  border: 2px solid var(--border-brand);
  border-radius: var(--radius-full);
  opacity: 0;
  transition: all 0.2s ease;
}

.active .toggle-base {
  background-color: var(--bg-brand-solid);
}

.active .toggle-switch {
  transform: translateX(16px);
}

.active:hover .toggle-base {
  background-color: var(--bg-brand-solid_hover);
}
</style>
