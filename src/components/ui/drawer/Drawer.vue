<script lang="ts" setup>
import { DrawerRoot } from 'vaul-vue'
import type { DrawerDirection } from 'vaul-vue'

// vaul-vue's DrawerRootProps has `fadeFromIndex?: never` which causes vue-tsc
// to collapse the intersection to `never`. We define our own props without it.
interface DrawerProps {
  activeSnapPoint?: number | string | null
  closeThreshold?: number
  shouldScaleBackground?: boolean
  setBackgroundColorOnScale?: boolean
  scrollLockTimeout?: number
  fixed?: boolean
  dismissible?: boolean
  modal?: boolean
  open?: boolean
  defaultOpen?: boolean
  nested?: boolean
  direction?: DrawerDirection
  snapPoints?: (string | number)[]
  handleOnly?: boolean
}

const props = withDefaults(defineProps<DrawerProps>(), {
  shouldScaleBackground: true,
})

const emits = defineEmits<{
  drag: [percentageDragged: number]
  release: [open: boolean]
  close: []
  'update:open': [open: boolean]
  'update:activeSnapPoint': [val: string | number]
  animationEnd: [open: boolean]
}>()
</script>

<template>
  <DrawerRoot
    data-slot="drawer"
    :should-scale-background="props.shouldScaleBackground"
    :active-snap-point="props.activeSnapPoint"
    :close-threshold="props.closeThreshold"
    :set-background-color-on-scale="props.setBackgroundColorOnScale"
    :scroll-lock-timeout="props.scrollLockTimeout"
    :fixed="props.fixed"
    :dismissible="props.dismissible"
    :modal="props.modal"
    :open="props.open"
    :default-open="props.defaultOpen"
    :nested="props.nested"
    :direction="props.direction"
    :snap-points="props.snapPoints"
    :handle-only="props.handleOnly"
    @drag="emits('drag', $event)"
    @release="emits('release', $event)"
    @close="emits('close')"
    @update:open="emits('update:open', $event)"
    @update:activeSnapPoint="emits('update:activeSnapPoint', $event)"
    @animationEnd="emits('animationEnd', $event)"
  >
    <slot />
  </DrawerRoot>
</template>
