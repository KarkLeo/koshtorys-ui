<script lang="ts" setup>
import { computed } from 'vue'
import { Toaster as Sonner, type ToasterProps } from 'vue-sonner'
import { useTheme } from '@/hooks/use-theme'

const props = defineProps<ToasterProps>()

const { theme } = useTheme()

const mergedProps = computed(() => ({
  ...props,
  theme: theme.value as ToasterProps['theme'],
}))
</script>

<template>
  <Sonner v-bind="mergedProps" class="toaster group" />
</template>
