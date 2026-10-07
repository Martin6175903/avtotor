import type { InferType } from 'yup';

import { documentSchema } from './api.schemas';

export type DocumentResponse = InferType<typeof documentSchema>;
