import { parseResponse, request } from '@services';

import { documentSchema } from './api.schemas';
import { DocumentResponse } from './api.types';

export const getDocument = async (
  documentId: string,
  signal?: AbortSignal,
): Promise<DocumentResponse> => {
  const data = await request(`/documents/${encodeURIComponent(documentId)}`, { signal });

  return parseResponse(documentSchema, data);
};
