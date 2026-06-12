<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'

const open = defineModel<boolean>('open', { default: false })
defineProps<{ title?: string }>()
const isDesktop = useMediaQuery('(min-width: 768px)')
</script>

<template>
  <Dialog v-if="isDesktop" v-model:open="open">
    <DialogContent>
      <DialogHeader v-if="title">
        <DialogTitle>{{ title }}</DialogTitle>
      </DialogHeader>
      <slot />
    </DialogContent>
  </Dialog>
  <Drawer v-else v-model:open="open">
    <DrawerContent class="h-[90vh] max-h-[90vh]">
      <DrawerHeader v-if="title">
        <DrawerTitle>{{ title }}</DrawerTitle>
      </DrawerHeader>
      <div class="flex-1 overflow-y-auto px-4 pb-6">
        <slot />
      </div>
    </DrawerContent>
  </Drawer>
</template>
