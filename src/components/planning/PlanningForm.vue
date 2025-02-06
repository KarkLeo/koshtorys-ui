<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import KitToggleBar from '@/components/kit/KitToggleBar.vue'
import KitMoneyInput from '@/components/kit/KitMoneyInput.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitCategories from '@/components/kit/KitCategories.vue'
import KitDatePicker from '@/components/kit/KitDatePicker.vue'
import KitButton from '@/components/kit/KitButton.vue'
import KitToggle from '@/components/kit/KitToggle.vue'

const { t } = useI18n()

const type = ref('transaction')
const amount = ref(0)
const currency = ref('USD')
const description = ref('')
const date = ref()
const categoryId = ref('')
const repeat = ref(false)

const getPlanningLabel = (type: string) => t(`planning.form.type.${type}`)
</script>

<template>
  <div class="planning-from">
    <div class="planning-form-header">
      <kit-toggle-bar
        v-model="type"
        :options="['transaction', 'category']"
        :get-option-label="getPlanningLabel"
      />
      <div class="planning-form-buttons">
        <kit-button size="md" variant="secondary-gray">{{
          $t('planning.form.buttons.cancel')
        }}</kit-button>
        <kit-button size="md">{{ $t('planning.form.buttons.add') }}</kit-button>
      </div>
    </div>
    <div class="planning-from-fields" v-if="type === 'category'">
      <kit-categories v-model="categoryId" @click.stop />
      <label class="planing-form-toggle">
        <kit-toggle v-model="repeat" label="Repeat" />
        {{ $t('planning.form.fields.repeat.label') }}
      </label>
      <div class="planing-form-amount">
        <kit-money-input
          v-model="amount"
          v-model:currency="currency"
          :placeholder="$t('transaction.form.fields.amount.placeholder') + ': 0.00'"
          :min="0"
        />
      </div>
    </div>
    <div class="planning-from-fields" v-else>
      <div class="planning-from-fields-group">
        <kit-input
          v-model="description"
          type="text"
          :placeholder="$t('transaction.form.fields.description.placeholder')"
        />
        <kit-categories v-model="categoryId" @click.stop class="planing-form-category" />
      </div>
      <div class="planning-from-fields-group">
        <kit-date-picker
          class="planing-form-date"
          v-model="date"
          full-width
          @click.stop
          size="xl"
        />
        <label class="planing-form-toggle">
          <kit-toggle v-model="repeat" label="Repeat" />
          {{ $t('planning.form.fields.repeat.label') }}
        </label>
      </div>
      <div class="planing-form-amount">
        <kit-money-input
          v-model="amount"
          v-model:currency="currency"
          :placeholder="$t('transaction.form.fields.amount.placeholder') + ': 0.00'"
          :min="0"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
.planning-from {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);

  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.planning-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.planning-form-buttons {
  display: flex;
  gap: 8px;
}

.planning-from-fields {
  display: grid;
  grid-template-columns: 3fr 2fr 1fr;
  gap: var(--spacing-md);
  width: 100%;
}

.planing-form-amount {
  grid-column: 3 / 4;
}

.planing-form-category {
  flex-shrink: 0;
  flex-grow: 0;
}

.planing-form-date {
  height: 46px;
}

.planning-from-fields-group {
  flex-grow: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.planing-form-toggle {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  box-sizing: border-box;

  cursor: pointer;
  user-select: none;
}

h2,
h5,
h6 {
  margin: 0;
}
</style>
