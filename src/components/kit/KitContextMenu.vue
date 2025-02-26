<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KitIconButton from '@/components/kit/KitIconButton.vue'
import IconDotsVertical from '@/components/icons/IconDotsVertical.vue'

const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="menuRef" :class="['kit-context-menu', { 'is-open': isOpen }]">
    <KitIconButton @click="isOpen = !isOpen" class="kit-context-menu-toggle" size="md">
      <IconDotsVertical />
    </KitIconButton>
    <div v-if="isOpen" class="kit-context-menu-panel">
      <slot />
    </div>
  </div>
</template>
<style scoped>
.kit-context-menu {
  position: relative;
}

.kit-context-menu.is-open {
  z-index: 9999;
}

.kit-context-menu-toggle {
  position: relative;
  z-index: 9;
}

.kit-context-menu-panel {
  position: absolute;
  right: calc(-1 * var(--spacing-xs) - 1px);
  top: calc(-1 * var(--spacing-xs) - 1px);
  overflow-x: hidden;

  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: max-content;
  padding: calc(var(--spacing-6xl) + 2 * var(--spacing-xs)) var(--spacing-xs) var(--spacing-xs);
  box-sizing: border-box;

  background: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  box-shadow:
    0 4px 6px -2px rgba(16, 24, 40, 0.03),
    0 12px 16px -4px rgba(16, 24, 40, 0.08);
  outline: none;
}
</style>
