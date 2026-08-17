<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import { NAV_TABS, ONBOARDING_PATHS } from '@/constants/menu'
import { useMe } from '@/hooks/auth-hooks.ts'
import { useGlobalAdd } from '@/composables/useGlobalAdd'

const route = useRoute()
const { user } = useMe()
const { open } = useGlobalAdd()

// На /planning центральная «+» создаёт план.
const addKind = computed(() => (route.name === 'planning' ? 'plan' : 'transaction'))

// «+» скрыта на вкладке настроек.
const showAdd = () => route.name !== 'settings'
</script>

<template>
  <nav
    v-if="user && route.path !== ONBOARDING_PATHS"
    class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur md:hidden"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <ul class="m-0 flex items-stretch justify-around p-0">
      <template v-for="(item, i) in NAV_TABS" :key="item.path">
        <!-- Центральная «+» между 2-й и 3-й вкладкой -->
        <li v-if="i === 2 && showAdd()" class="flex list-none items-center">
          <button
            type="button"
            :aria-label="$t('nav.add')"
            class="-mt-4 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
            @click="open(addKind)"
          >
            <Plus class="size-6" />
          </button>
        </li>
        <li class="list-none">
          <router-link
            :to="item.path"
            class="flex flex-col items-center gap-0.5 whitespace-nowrap px-2 py-2 text-[10px] leading-tight text-muted-foreground no-underline [&.active]:text-foreground [&_svg]:size-5"
            active-class="active"
          >
            <component :is="item.icon" />
            <span>{{ $t(`nav.${item.name}`) }}</span>
          </router-link>
        </li>
      </template>
    </ul>
  </nav>
</template>
