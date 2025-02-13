import * as yup from 'yup'
import { CURRENCIES } from '@/constants/currencies.ts'
import { TRANSACTION_CATEGORIES } from '@/constants/transaction-categories.ts'

export const transactionSchema = yup.object().shape({
  amount: yup.number().required('amount_required').min(0.01, 'amount_min'),
  currency: yup.string().required('currency_required').oneOf(CURRENCIES, 'currency_invalid'),
  date: yup
    .date()
    .required('date_required')
    .test('date_max', 'date_max', (value) => value && value <= new Date()),
  description: yup.string().notRequired().max(255, 'description_max'),
  categoryId: yup
    .string()
    .required('category_required')
    .oneOf(TRANSACTION_CATEGORIES, 'category_invalid'),
})
