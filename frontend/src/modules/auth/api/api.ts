import { parseResponse, request } from '@services';

import { currentUserSchema } from './api.schemas';
import { CurrentUser, LoginRequest } from './api.types';

export const login = async ({ username, password }: LoginRequest): Promise<CurrentUser> => {
  const data = await request('/auth/login', {
    method: 'POST',
    body: {
      username,
      password,
    },
  });

  return parseResponse(currentUserSchema, data);
};

export const getCurrentUser = async (signal?: AbortSignal): Promise<CurrentUser> => {
  const data = await request('/auth/me', { signal });

  return parseResponse(currentUserSchema, data);
};

export const logout = async (): Promise<void> => {
  await request('/auth/logout', {
    method: 'POST',
  });
};
