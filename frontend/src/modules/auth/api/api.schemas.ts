import { object, string } from 'yup';

export const currentUserSchema = object({
  id: string().required(),
  name: string().required(),
  role: string()
    .oneOf(['user', 'hr', 'admin'] as const)
    .required(),
}).required();
