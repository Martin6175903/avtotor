import { useNavigate } from 'react-router-dom';

import { login } from './api';
import { LoginForm } from './components';
import styles from './LoginPage.module.scss';
import type { LoginFormValues } from './schemas';

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues): Promise<void> => {
    await login(values);

    navigate('/', { replace: true });
  };

  return (
    <section className={styles.page} aria-labelledby="login-title">
      <div className={styles.heading}>
        <h1 className={styles.title} id="login-title">
          Вход в базу знаний
        </h1>

        <p className={styles.description}>Используйте тестовую учётную запись.</p>
      </div>

      <div className={styles.card}>
        <LoginForm onSubmit={handleLogin} />
      </div>
    </section>
  );
};
