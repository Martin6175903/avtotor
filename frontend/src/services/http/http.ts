import axios from 'axios';

import { API_PREFIX, REQUEST_TIMEOUT_MS } from './http.constants';
import { RequestOptions } from './http.types';
import { ApiError, getHttpErrorMessage } from './http.utils';

const apiClient = axios.create({
  baseURL: API_PREFIX,
  timeout: REQUEST_TIMEOUT_MS,
  responseType: 'json',
  headers: {
    Accept: 'application/json',
  },
  transitional: {
    silentJSONParsing: false,
  },
});

export const request = async (
  path: string,
  { method = 'GET', body, signal }: RequestOptions = {},
): Promise<unknown> => {
  try {
    const response = await apiClient.request<unknown>({
      url: path,
      method,
      data: body,
      signal,
    });

    return response.status === 204 ? undefined : response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw new DOMException('Request cancelled.', 'AbortError');
    }

    if (!axios.isAxiosError(error)) {
      throw error;
    }

    if (error.response) {
      throw new ApiError(getHttpErrorMessage(error.response.status), error.response.status);
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new ApiError('Сервис не ответил вовремя. Попробуйте ещё раз.');
    }

    if (error.code === 'ERR_BAD_RESPONSE') {
      throw new ApiError('Сервис вернул некорректный ответ.');
    }

    throw new ApiError('Не удалось связаться с сервисом.');
  }
};
