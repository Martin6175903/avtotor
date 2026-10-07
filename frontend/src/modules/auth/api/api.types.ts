import { InferType } from 'yup';

import { currentUserSchema } from './api.schemas';

export type CurrentUser = InferType<typeof currentUserSchema>;

export type LoginRequest = {
  username: string;
  password: string;
};
