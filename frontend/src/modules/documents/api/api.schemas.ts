import { object, string } from 'yup';

export const documentSchema = object({
  id: string().required(),
  title: string().required(),
  text: string().required(),
}).required();
