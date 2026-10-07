import { array, object, string } from 'yup';

export const sourceSchema = object({
  id: string()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .required(),
  title: string().required(),
  url: string().required(),
}).required();

export const askResponseSchema = object({
  answer: string().required(),
  sources: array().of(sourceSchema).required(),
}).required();
