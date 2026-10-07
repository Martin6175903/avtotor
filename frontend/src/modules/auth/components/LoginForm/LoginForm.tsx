import { Alert, Button, Input } from '@components';
import { yupResolver } from '@hookform/resolvers/yup';
import { ApiError } from '@services';
import { useForm } from 'react-hook-form';

import { type LoginFormValues, loginSchema } from '../../schemas';
import styles from './LoginForm.module.scss';
import { LoginFormProps } from './LoginForm.types';

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const submit = async (values: LoginFormValues) => {
    clearErrors('root');

    try {
      await onSubmit(values);
    } catch (error) {
      let message: string = 'Не удалось войти. Попробуйте ещё раз.';

      if (error instanceof ApiError) {
        message = error.status === 401 ? 'Неверный логин или пароль.' : error.message;
      }

      setError('root.submit', {
        type: 'submit',
        message,
      });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
      <fieldset className={styles.fields} disabled={isSubmitting}>
        <Input
          {...register('username')}
          label="Логин"
          placeholder="Введите логин"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          error={errors.username?.message}
        />

        <Input
          {...register('password')}
          label="Пароль"
          type="password"
          placeholder="Введите пароль"
          autoComplete="current-password"
          required
          error={errors.password?.message}
        />

        <Button type="submit" isLoading={isSubmitting} loadingText="Входим…">
          Войти
        </Button>
      </fieldset>

      {errors.root?.submit?.message && (
        <Alert variant="error" announcement="assertive">
          {errors.root.submit.message}
        </Alert>
      )}
    </form>
  );
};
