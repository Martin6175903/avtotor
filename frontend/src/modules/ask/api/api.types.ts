import { InferType } from 'yup';

import { askResponseSchema } from './ask.schemas';

export type AskResponse = InferType<typeof askResponseSchema>;
