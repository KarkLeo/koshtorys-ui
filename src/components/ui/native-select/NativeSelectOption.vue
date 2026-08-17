<!-- @fallthroughAttributes true -->
<!-- @strictTemplates true -->

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <!-- Under vue-tsc 3, Vue's OptionHTMLAttributes type has no data-* escape hatch,
       so a literal `data-slot="..."` attribute fails excess-property checking here
       (TS2353) even though the identical pattern works on other native elements.
       Passing it through v-bind with a static key renders the exact same attribute
       but isn't checked as an object literal. Regenerating this component via
       shadcn-vue will drop this workaround and reintroduce the error. -->
  <option
    v-bind="{ 'data-slot': 'native-select-option' }"
    :class="cn('bg-popover text-popover-foreground', props.class)"
  >
    <slot />
  </option>
</template>
