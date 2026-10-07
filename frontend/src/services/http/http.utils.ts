import { Schema } from 'yup';

export class ApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
  }
}

export const getHttpErrorMessage = (status: number): string => {
  switch (status) {
    case 401:
      return 'Необходимо войти в систему.';

    case 403:
      return 'Недостаточно прав для выполнения действия.';

    case 404:
      return 'Запрошенный ресурс не найден.';

    case 422:
      return 'Сервер отклонил данные. Проверьте заполнение формы.';

    case 429:
      return 'Слишком много запросов. Попробуйте немного позже.';

    default:
      return status >= 500
        ? 'Сервис временно недоступен. Попробуйте позже.'
        : 'Не удалось выполнить запрос.';
  }
};

export const parseResponse = async <T>(schema: Schema<T>, data: unknown): Promise<T> => {
  try {
    return await schema.validate(data, {
      strict: true,
      abortEarly: false,
    });
  } catch {
    throw new ApiError('Формат ответа сервиса не соответствует ожидаемому.');
  }
};
