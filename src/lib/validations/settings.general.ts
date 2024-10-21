import * as yup from 'yup';

const settingsGeneralSchema = yup.object().shape({
	lang: yup.string().oneOf(['en', 'uk-UA'], 'lang_invalid').required('lang_required'),

	name: yup.string().required('name_required').min(3, 'name_min_length').max(20, 'name_max_length'),

	newPassword: yup
		.string()
		.nullable()
		.notRequired()
		.test('min-length-if-filled', 'newPassword_min_length', function (value) {
			if (value && value.length > 0) {
				return value.length >= 6;
			}
			return true;
		}),

	confirmNewPassword: yup.string().when('newPassword', (newPassword, schema) => {
		return newPassword[0]
			? schema.oneOf([yup.ref('newPassword')], 'confirmNewPassword_mismatch')
			: schema.optional();
	}),

	oldPassword: yup.string().when('newPassword', (newPassword, schema) => {
		return newPassword[0] ? schema.required('oldPassword_required') : schema.optional();
	})
});

export default settingsGeneralSchema;
