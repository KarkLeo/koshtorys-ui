<script setup lang="ts">
import { shallowRef } from 'vue'

type Tab = {
  key: string
  // eslint-disable-next-line
  component: any
}

const { tabs } = defineProps<{
  tabs: Tab[]
  langPrefix: string
}>()

const activeTab = shallowRef<Tab>(tabs[0])
</script>

<template>
  <div class="tab-wrapper">
    <ul class="tab-list">
      <li class="tab-item" v-for="tabItem in tabs" :key="tabItem.key">
        <button
          @click="activeTab = tabItem"
          :class="['tab-button', { active: activeTab.key === tabItem.key }]"
        >
          {{ $t(langPrefix + tabItem.key) }}
        </button>
      </li>
    </ul>

    <div class="tab-container">
      <component :is="activeTab.component" />
    </div>
  </div>
</template>

<style scoped>
.tab-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 0 var(--spacing-4xl);
  max-width: calc(var(--container-max-width-desktop) + 2 * var(--spacing-4xl));
  width: 100%;
  margin: var(--spacing-2xl) auto;
  gap: var(--spacing-4xl);
  box-sizing: border-box;
}
.tab-list {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: min-content;
  gap: var(--spacing-xs);
  margin: 0;
  padding: var(--spacing-xs);
  box-sizing: border-box;

  list-style: none;

  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-lg);
}
.tab-item {
  padding: 0;
  margin: 0;
}

.tab-button {
  padding: var(--spacing-md) var(--spacing-lg);
  margin: 0;

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-quaternary);

  background-color: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}
.tab-button:hover,
.tab-button.active {
  color: var(--text-secondary);

  background-color: var(--bg-primary_alt);
  box-shadow: var(--shadow-sm);
}

.tab-container {
  width: 100%;

  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
}
</style>
