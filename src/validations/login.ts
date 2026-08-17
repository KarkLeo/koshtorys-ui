import * as yup from 'yup'

export const loginSchema = yup.object().shape({
  email: yup.string().email('email_invalid').required('email_required'),
  password: yup.string().required('password_required'),
})
