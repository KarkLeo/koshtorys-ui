<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { XIcon } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer'

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
    <!-- Полноэкранная мобильная форма: без drag-handle, без скруглений, с крестиком -->
    <DrawerContent
      class="h-dvh max-h-dvh rounded-none border-0 data-[vaul-drawer-direction=bottom]:mt-0 [&>div:first-child]:hidden"
    >
      <DrawerHeader v-if="title" class="flex flex-row items-center justify-between">
        <DrawerTitle>{{ title }}</DrawerTitle>
        <DrawerClose
          class="text-muted-foreground hover:text-foreground rounded-full p-1 transition"
          aria-label="Close"
        >
          <XIcon class="size-5" />
        </DrawerClose>
      </DrawerHeader>
      <div class="flex-1 overflow-y-auto px-4 pb-6">
        <slot />
      </div>
    </DrawerContent>
  </Drawer>
</template>
