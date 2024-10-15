import * as Yup from 'yup';

const settingsGeneral = Yup.object().shape({
	name: Yup.string().required('Имя обязательно'),

	newPassword: Yup.string().optional(),

	confirmNewPassword: Yup.string().when('newPassword', {
		// eslint-disable-next-line
		// @ts-expect-error
		is: (newPassword) => Boolean(newPassword),
		then: Yup.string()
			.oneOf([Yup.ref('newPassword')], 'Пароли должны совпадать')
			.required('Подтвердите новый пароль'),
		otherwise: Yup.string().optional()
	}),

	oldPassword: Yup.string().when('newPassword', {
		// eslint-disable-next-line
		// @ts-expect-error
		is: (newPassword) => Boolean(newPassword),
		then: Yup.string().required('Старый пароль обязателен при изменении пароля'),
		otherwise: Yup.string().optional()
	})
});

export default settingsGeneral;
