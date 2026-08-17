<script setup lang="ts">
import { AlertDialogTrigger, useForwardProps } from 'reka-ui'
import type { AlertDialogTriggerProps } from 'reka-ui'

const props = defineProps<AlertDialogTriggerProps>()

const forwardedProps = useForwardProps(props)
</script>

<template>
  <AlertDialogTrigger data-slot="alert-dialog-trigger" v-bind="forwardedProps">
    <slot />
  </AlertDialogTrigger>
</template>
