import * as yup from 'yup'

export const registerSchema = yup.object().shape({
  name: yup.string().required('name_required').min(3, 'name_min_length').max(20, 'name_max_length'),
  email: yup.string().email('email_invalid').required('email_required'),
  password: yup.string().required('password_required').min(6, 'password_min_length'),
  confirmPassword: yup
    .string()
    .required('confirmPassword_required')
    .oneOf([yup.ref('password')], 'confirmPassword_mismatch'),
})
