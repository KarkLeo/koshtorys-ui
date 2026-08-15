<script setup lang="ts">
import PlanCategoryGroup from '@/components/planning/PlanCategoryGroup.vue'
import type { PreparedPlan } from '@/helpers/planning-rest'

defineProps<{
  groups: { category: string; items: PreparedPlan[]; total: number }[]
  currency: string
  busyId?: string | null
}>()
defineEmits<{ repeat: [id: string]; cancelRepeat: [id: string] }>()
</script>

<template>
  <section v-if="groups.length" class="flex flex-col gap-3">
    <h2 class="text-sm font-medium text-muted-foreground">{{ $t('planning.suggestions.title') }}</h2>
    <PlanCategoryGroup
      v-for="group in groups"
      :key="'suggestion-' + group.category"
      :group="group"
      :currency="currency"
      variant="suggestion"
      :busy-id="busyId"
      @repeat="$emit('repeat', $event)"
      @cancel-repeat="$emit('cancelRepeat', $event)"
    />
  </section>
</template>
