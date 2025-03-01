<script setup lang="ts">
import { usePlanningList } from '@/hooks/planning-hooks.ts'

import KitModal from '@/components/kit/KitModal.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import KitRadio from '@/components/kit/KitRadio.vue'
import { usePlanningMapper } from '@/mappers/planning-mapper.ts'

const emit = defineEmits(['close', 'submit'])
const model = defineModel<string | null>()
defineProps<{
  oldPlanningId?: string | null
}>()

// ===== Hooks =====

const { planning } = usePlanningList()

// ===== Computed =====

const { planningTables } = usePlanningMapper()

// ===== Handlers =====

const cancelHandler = () => {
  model.value = null
}

const submitHandler = () => {
  emit(
    'submit',
    planning?.value?.planning.find((plan) => plan.id === model.value),
  )
}

const closeHandler = () => {
  emit('close')
}
</script>

<template>
  <KitModal
    :title="$t('transaction.selectPlanning.title')"
    :subtitle="$t('transaction.selectPlanning.subtitle')"
    :cancelText="$t('transaction.selectPlanning.buttons.cancel')"
    :submitText="$t('transaction.selectPlanning.buttons.submit')"
    @cancel="cancelHandler"
    @submit="submitHandler"
    @close="closeHandler"
  >
    <div class="planning-content">
      <div class="planning-table" v-for="table in planningTables" :key="table.category">
        <div class="planning-table-body">
          <label
            class="planning-table-item"
            v-for="plan in table.items.filter((plan) => plan.type === 'TRANSACTION')"
            :key="plan.id"
            :class="{
              disabled: (plan?.original.transactions?.length || 0) > 0 && plan.id !== oldPlanningId,
            }"
          >
            <span class="planning-table-item-radio">
              <KitRadio v-model="model" name="planning" :value="plan.id" />
            </span>
            <span class="planning-table-item-main">
              <span>{{ plan.description }}</span>
              <span
                class="planning-table-item-category"
                :style="{
                  '--color': plan.categoryColor,
                }"
              >
                {{ plan.categoryName }}
              </span>
            </span>
            <span class="planning-table-item-date" v-if="plan.date">
              <IconCalendar /> {{ plan.date }}
            </span>
            <span class="planning-table-item-amount">
              <span
                class="planning-table-item-amount-original"
                v-if="plan.originalAmount && plan.originalCurrency"
              >
                {{ plan.originalAmount }} {{ plan.originalCurrency }} /
              </span>
              {{ plan.amount }} {{ plan.currency }}
            </span>
          </label>
        </div>
      </div>
    </div>
  </KitModal>
</template>

<style scoped>
.planning-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.planning-table {
  display: flex;
  flex-direction: column;

  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.planning-table-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-xl) var(--spacing-3xl);
  box-sizing: border-box;

  border-top: 1px solid var(--border-secondary);
}

.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.planning-table-item-main {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.planning-table-item-amount {
  margin-left: auto;
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  flex-direction: row-reverse;
  gap: 1ch;
}

.planning-table-item-amount-original {
  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
}

.planning-table-item-date {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}
.planning-table-item-date svg {
  width: var(--line-height-text-sm);
  height: var(--line-height-text-sm);
}

.planning-table-item-category {
  box-sizing: border-box;
  width: min-content;
  overflow: hidden;

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-md);
  font-weight: var(--font-weight-medium);
  color: var(--color);
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
