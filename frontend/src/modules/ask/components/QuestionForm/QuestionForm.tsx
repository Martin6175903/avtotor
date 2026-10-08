import { Alert, Button, Textarea } from '@components';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch } from 'react-hook-form';

import { QUESTION_MAX_LENGTH, type QuestionFormValues, questionSchema } from '../../schemas';
import styles from './QuestionForm.module.scss';
import { QuestionFormProps } from './QuestionForm.types';

export const QuestionForm = ({ onSubmit }: QuestionFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormValues>({
    resolver: yupResolver(questionSchema),
    defaultValues: {
      question: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const question = useWatch({
    control,
    name: 'question',
    defaultValue: '',
  });

  const submit = async (values: QuestionFormValues) => {
    clearErrors('root');

    try {
      await onSubmit(values);
    } catch {
      setError('root.submit', {
        type: 'submit',
        message: 'Сервис временно недоступен. Попробуйте позже.',
      });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
      <fieldset className={styles.fields} disabled={isSubmitting}>
        <Textarea
          {...register('question')}
          label="Ваш вопрос"
          placeholder="Например: как оформить отпуск?"
          maxLength={QUESTION_MAX_LENGTH}
          hint={`${question.length} / ${QUESTION_MAX_LENGTH} символов`}
          error={errors.question?.message}
          required
        />

        <div className={styles.actions}>
          <Button type="submit" isLoading={isSubmitting} loadingText="Ищем ответ…">
            Получить ответ
          </Button>
        </div>
      </fieldset>

      {errors.root?.submit?.message && (
        <Alert variant="error" announcement="assertive">
          {errors.root.submit.message}
        </Alert>
      )}
    </form>
  );
};
