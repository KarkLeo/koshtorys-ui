<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { XIcon } from 'lucide-vue-next'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories'
import { getMainCategory } from '@/helpers/category'
import IconLink from '@/components/icons/IconLink.vue'

interface SelectedPlan {
  description: string
  categoryId: string
  amount: number
  currency: string
}

defineProps<{ plan: SelectedPlan }>()
const emit = defineEmits<{ unlink: [] }>()
const { t } = useI18n()
const colorOf = (id: string) => TRANSACTION_CATEGORIES_COLORS[getMainCategory(id)] || 'transparent'
</script>

<template>
  <div class="border-primary/40 bg-primary/5 flex items-center gap-3 rounded-xl border p-3">
    <IconLink class="text-primary size-5 shrink-0" />
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium">
        {{ plan.description || t('transaction.form.actions.planning') }}
      </p>
      <span class="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
        <span
          class="size-2 shrink-0 rounded-full"
          :style="{ backgroundColor: colorOf(plan.categoryId) }"
        />
        <span class="truncate">{{ t(`categories.${plan.categoryId}`) }}</span>
        <span aria-hidden>·</span>
        <span class="whitespace-nowrap">{{ plan.amount }} {{ plan.currency }}</span>
      </span>
    </div>
    <button
      type="button"
      class="text-muted-foreground hover:text-foreground shrink-0 rounded-full p-1 transition"
      :aria-label="t('transaction.selectPlanning.buttons.cancel')"
      @click="emit('unlink')"
    >
      <XIcon class="size-4" />
    </button>
  </div>
</template>
