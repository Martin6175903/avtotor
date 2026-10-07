import { Button, Input } from '@components';

export const LoginPage = () => {
  return (
    <section>
      <h1 id="login-title">Вход</h1>

      <Input
        label="Логин"
        name="username"
        autoComplete="username"
        hint="Используйте тестовую учётную запись."
      />

      <Input
        label="Пароль"
        name="password"
        type="password"
        autoComplete="current-password"
        error="Введите пароль."
      />

      <Button>Войти</Button>
      <Button variant="secondary">Повторить</Button>
      <Button isLoading loadingText="Входим…">
        Войти
      </Button>
    </section>
  );
};
