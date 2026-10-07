import { InferType, object, string } from 'yup';

export const loginSchema = object({
  username: string().trim().required('Введите логин.'),
  password: string().required('Введите пароль'),
});

export type LoginFormValues = InferType<typeof loginSchema>;
