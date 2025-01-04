<script setup lang="ts">
import { computed, ref } from 'vue'

import { useMe } from '@/hooks/auth-hooks.ts'
import { CURRENCIES } from '@/constants/currencies.ts'

import KitMoneyInput from '@/components/kit/KitMoneyInput.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitButton from '@/components/kit/KitButton.vue'

const { me } = useMe()

const transactionValue = ref('')
const currency = ref(me.value?.me.currency || CURRENCIES[0])
const isFocused = ref(false)
const transactionTitle = ref('')

const showFullComponent = computed(
  () => isFocused.value || Boolean(transactionValue.value) || Boolean(transactionTitle.value),
)
</script>

<template>
  <div :class="['add-transaction-form', { active: showFullComponent }]">
    <kit-money-input
      v-model="transactionValue"
      @focus="isFocused = true"
      @blur="isFocused = false"
      v-model:currency="currency"
    />
    <kit-input
      v-model="transactionTitle"
      bind:value="{transactionTitle}"
      @focus="isFocused = true"
      @blur="isFocused = false"
      type="text"
    />
    <kit-button>Save</kit-button>
  </div>
</template>

<style scoped>
.add-transaction-form {
  position: fixed;

  bottom: 0;

  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;

  border: 1px solid red;
  background-color: violet;
  border-radius: 8px;

  transform: translateY(calc(100% - 70px));
  transition: all 0.5s ease-in-out;
}
.active {
  transform: translateY(0);
}
</style>
