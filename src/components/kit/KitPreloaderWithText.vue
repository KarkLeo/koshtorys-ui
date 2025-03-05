<script setup lang="ts">
import KitPreloader from '@/components/kit/KitPreloader.vue'

const { size = 'sm' } = defineProps<{
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>()
</script>
<template>
  <div class="kit-preloader">
    <KitPreloader :size="size" />
    <span class="kit-preloader-text">{{ $t('common.loading') }}</span>
  </div>
</template>
<style scoped>
.kit-preloader {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xl);
}

.kit-preloader-text {
  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
  text-align: center;
}
</style>
