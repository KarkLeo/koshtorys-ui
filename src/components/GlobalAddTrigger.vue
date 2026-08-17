<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { useGlobalAdd } from '@/composables/useGlobalAdd'
import { ONBOARDING_PATHS } from '@/constants/menu'

const { t } = useI18n()
const route = useRoute()
const { open } = useGlobalAdd()

// На /planning «+» создаёт план, везде остальное — транзакцию.
const kind = computed(() => (route.name === 'planning' ? 'plan' : 'transaction'))
const label = computed(() =>
  kind.value === 'plan' ? t('nav.add_plan') : t('transaction.form.buttons.add'),
)
</script>

<template>
  <!-- Desktop-only pill (на мобилке add идёт через центральную «+» BottomTabBar). Скрыта на settings и onboarding. -->
  <div
    v-if="route.name !== 'settings' && route.path !== ONBOARDING_PATHS"
    class="fixed inset-x-0 bottom-0 z-40 mx-auto hidden max-w-2xl justify-center p-4 md:flex"
  >
    <Button size="lg" class="w-full rounded-full shadow-lg" @click="open(kind)">
      + {{ label }}
    </Button>
  </div>
</template>
