import { type InferType, object, string } from 'yup';

export const QUESTION_MAX_LENGTH = 2000;

export const questionSchema = object({
  question: string()
    .trim()
    .required('Введите вопрос.')
    .max(QUESTION_MAX_LENGTH, `Вопрос должен содержать не больше ${QUESTION_MAX_LENGTH} символов.`),
});

export type QuestionFormValues = InferType<typeof questionSchema>;
