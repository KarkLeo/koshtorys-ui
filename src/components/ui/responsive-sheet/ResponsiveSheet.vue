<script setup lang="ts">
import { ref, watch } from 'vue'
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

// On touch, opening this Drawer from a dropdown/popover item makes the just-mounted Drawer catch
// the SAME outside-dismiss interaction that closed the menu, so it closes instantly. Swallow any
// outside dismiss in the first moment after the Drawer opens; genuine dismissals happen later.
const openedAt = ref(0)
watch(open, (isOpen) => {
  if (isOpen) openedAt.value = Date.now()
})
const guardEarlyDismiss = (event: Event) => {
  if (Date.now() - openedAt.value < 500) event.preventDefault()
}
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
  <!-- should-scale-background=false: keep the page put behind a dimmed+blurred overlay backdrop
       (see DrawerOverlay) instead of vaul's iOS-style background scaling. -->
  <Drawer
    v-else
    v-model:open="open"
    :should-scale-background="false"
    :modal="true"
    :dismissible="true"
  >
    <!-- Полноэкранная мобильная форма: без drag-handle, без скруглений, с крестиком -->
    <DrawerContent
      class="h-dvh max-h-dvh rounded-none border-0 data-[vaul-drawer-direction=bottom]:mt-0 [&>div:first-child]:hidden"
      @pointer-down-outside="guardEarlyDismiss"
      @interact-outside="guardEarlyDismiss"
      @focus-outside="guardEarlyDismiss"
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
