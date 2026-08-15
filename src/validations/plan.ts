import * as yup from 'yup'
import { CURRENCIES } from '@/constants/currencies.ts'
import { TRANSACTION_CATEGORIES } from '@/constants/transaction-categories.ts'

export const planSchema = yup.object().shape({
  type: yup.string().oneOf(['TRANSACTION', 'CATEGORY'], 'type_invalid').required('type_required'),

  amount: yup.number().required('amount_required').min(0.01, 'amount_min'),
  currency: yup.string().required('currency_required').oneOf(CURRENCIES, 'currency_invalid'),
  categoryId: yup
    .string()
    .required('category_required')
    .oneOf(TRANSACTION_CATEGORIES, 'category_invalid'),
  repeat: yup.boolean().optional(),

  description: yup.string().when('type', {
    is: 'TRANSACTION',
    then: (schema) => schema.required('description_required').max(255, 'description_max'),
    otherwise: (schema) => schema.strip(),
  }),

  date: yup.date().when('type', {
    is: 'TRANSACTION',
    then: (schema) => schema.optional(),
    otherwise: (schema) => schema.strip(),
  }),
})
