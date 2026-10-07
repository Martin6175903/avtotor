import { parseResponse, request } from '@services';

import { AskResponse } from './api.types';
import { askResponseSchema } from './ask.schemas';

export const askQuestion = async (question: string, signal?: AbortSignal): Promise<AskResponse> => {
  const data = await request('/ask', {
    method: 'POST',
    body: {
      question,
    },
    signal,
  });

  return parseResponse(askResponseSchema, data);
};
