<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ValidationError } from 'yup'
import KitToggleBar from '@/components/kit/KitToggleBar.vue'
import KitMoneyInput from '@/components/kit/KitMoneyInput.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitCategories from '@/components/kit/KitCategories.vue'
import KitDatePicker from '@/components/kit/KitDatePicker.vue'
import KitButton from '@/components/kit/KitButton.vue'
import KitToggle from '@/components/kit/KitToggle.vue'
import { planSchema } from '@/validations/plan.ts'
import KitSimpleFieldWrapper from '@/components/kit/KitSimpleFieldWrapper.vue'
import { CURRENCIES } from '@/constants/currencies.ts'
import { useMe } from '@/hooks/auth-hooks.ts'

const { t } = useI18n()
const { me } = useMe()

const type = ref('transaction')
const amount = ref('0')
const currency = ref(me.value?.me.currency || CURRENCIES[0])
const description = ref('')
const date = ref()
const categoryId = ref('')
const repeat = ref(false)
const errors = ref<Record<string, string>>({})

const getPlanningLabel = (type: string) => t(`planning.form.type.${type}`)

const validateForm = async () => {
  try {
    await planSchema.validate(
      {
        type: type.value,
        amount: parseFloat(amount.value || '0'),
        currency: currency.value,
        description: description.value,
        categoryId: categoryId.value,
        date: date.value?.toISOString(),
        repeat: repeat.value,
      },
      { abortEarly: false },
    )
    errors.value = {}
    console.log('Plan is valid')
    return true
    // eslint-disable-next-line
  } catch (validationErrors: any) {
    console.log('validationErrors', validationErrors)
    errors.value = (validationErrors as ValidationError).inner.reduce(
      // eslint-disable-next-line
      (acc: Record<string, string>, error: any) => {
        if (!acc[error.path]) acc[error.path] = error.message
        return acc
      },
      {},
    )
    console.log('Plan is invalid')
    console.log(errors.value)
    return false
  }
}
const clearForm = () => {
  amount.value = ''
  currency.value = me.value?.me.currency || CURRENCIES[0]
  description.value = ''
  categoryId.value = ''
  date.value = undefined
  repeat.value = false
  errors.value = {}
}
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
        <kit-button size="md" variant="secondary-gray" @click="clearForm">
          {{ $t('planning.form.buttons.cancel') }}</kit-button
        >
        <kit-button size="md" @click="validateForm">{{
          $t('planning.form.buttons.add')
        }}</kit-button>
      </div>
    </div>
    <div class="planning-from-fields" v-if="type === 'category'">
      <kit-simple-field-wrapper
        :error="Boolean(errors?.categoryId)"
        :message="errors?.categoryId ? $t(`planning.form.errors.${errors.categoryId}`) : ''"
      >
        <kit-categories v-model="categoryId" @click.stop :error="Boolean(errors?.categoryId)" />
      </kit-simple-field-wrapper>
      <label class="planing-form-toggle">
        <kit-toggle v-model="repeat" label="Repeat" />
        {{ $t('planning.form.fields.repeat.label') }}
      </label>
      <div class="planing-form-amount">
        <kit-simple-field-wrapper
          :error="Boolean(errors?.amount)"
          :message="errors?.amount ? $t(`planning.form.errors.${errors.amount}`) : ''"
        >
          <kit-money-input
            v-model="amount"
            v-model:currency="currency"
            :placeholder="$t('planning.form.fields.amount.placeholder') + ': 0.00'"
            :min="0"
            :error="Boolean(errors?.amount)"
          />
        </kit-simple-field-wrapper>
      </div>
    </div>
    <div class="planning-from-fields" v-else>
      <div class="planning-from-fields-group">
        <kit-simple-field-wrapper
          :error="Boolean(errors?.description)"
          :message="errors?.description ? $t(`planning.form.errors.${errors.description}`) : ''"
        >
          <kit-input
            v-model="description"
            type="text"
            :placeholder="$t('planning.form.fields.description.placeholder')"
            :error="Boolean(errors?.description)"
          />
        </kit-simple-field-wrapper>
        <kit-simple-field-wrapper
          :error="Boolean(errors?.categoryId)"
          :message="errors?.categoryId ? $t(`planning.form.errors.${errors.categoryId}`) : ''"
        >
          <kit-categories
            v-model="categoryId"
            @click.stop
            class="planing-form-category"
            :error="Boolean(errors?.categoryId)"
          />
        </kit-simple-field-wrapper>
      </div>
      <div class="planning-from-fields-group">
        <kit-simple-field-wrapper
          :error="Boolean(errors?.date)"
          :message="errors?.date ? $t(`planning.form.errors.${errors.date}`) : ''"
        >
          <kit-date-picker
            class="planing-form-date"
            v-model="date"
            full-width
            @click.stop
            size="xl"
            :error="Boolean(errors?.date)"
          />
        </kit-simple-field-wrapper>
        <label class="planing-form-toggle">
          <kit-toggle v-model="repeat" label="Repeat" />
          {{ $t('planning.form.fields.repeat.label') }}
        </label>
      </div>
      <div class="planing-form-amount">
        <kit-simple-field-wrapper
          :error="Boolean(errors?.amount)"
          :message="errors?.amount ? $t(`planning.form.errors.${errors.amount}`) : ''"
        >
          <kit-money-input
            v-model="amount"
            v-model:currency="currency"
            :placeholder="$t('planning.form.fields.amount.placeholder') + ': 0.00'"
            :min="0"
            :error="Boolean(errors?.amount)"
          />
        </kit-simple-field-wrapper>
      </div>
    </div>
  </div>
</template>
<style scoped>
.planning-from {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-3xl);
  padding: var(--spacing-xl);

  border: 1px solid var(--border-primary);
  border-radius: var(--radius-2xl);
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
  grid-template-columns: 5fr 4fr 3fr;
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
  height: 42px;
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
