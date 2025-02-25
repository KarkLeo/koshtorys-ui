<script setup lang="ts">
const model = defineModel<string | null>()
</script>

<template>
  <label :class="['kit-radio', { active: model === $attrs.value }]">
    <input class="kit-radio-input" v-model="model" type="radio" v-bind="$attrs" />
    <span class="kit-radio-base" />
    <span class="kit-radio-outline" />
  </label>
</template>

<style scoped>
.kit-radio {
  position: relative;
  display: inline-block;
  width: 16px;
  height: 16px;

  line-height: var(--line-height-text-xs);

  cursor: pointer;
}

.kit-radio-input {
  position: absolute;

  opacity: 0;
}
.kit-radio-input:focus ~ .kit-radio-outline {
  opacity: 1;
}

.kit-radio-base {
  display: block;
  width: 16px;
  height: 16px;
  box-sizing: border-box;

  border: 1px solid var(--border-primary);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.kit-radio-outline {
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

.active .kit-radio-base {
  border: 5px solid var(--bg-brand-solid);
}
</style>
