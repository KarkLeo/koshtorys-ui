<script setup lang="ts">
import type { ComboboxTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { ComboboxTrigger, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<ComboboxTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardProps(delegatedProps)

// reka-ui renders the trigger with tabindex="-1", expecting focus to live in an input.
// Ours has no input outside the list, so the literal tabindex in the template makes it tabbable.
</script>

<template>
  <ComboboxTrigger
    data-slot="combobox-trigger"
    v-bind="forwarded"
    :class="cn('', props.class)"
    tabindex="0"
  >
    <slot />
  </ComboboxTrigger>
</template>
