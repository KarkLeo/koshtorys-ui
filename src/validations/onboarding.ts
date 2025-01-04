import * as yup from 'yup'
import { CURRENCIES } from '@/constants/currencies'

export const onboardingSchema = yup.object().shape({
  currency: yup.string().oneOf(CURRENCIES, 'currency_invalid').required('currency_required'),

  monthStartDay: yup
    .number()
    .min(1, 'monthStartDay_min')
    .max(28, 'monthStartDay_max')
    .required('monthStartDay_required'),

  monthlyBudget: yup
    .number()
    .min(0, 'monthlyBudget_min')
    .max(1000000, 'monthlyBudget_max')
    .required('monthlyBudget_required'),
})
