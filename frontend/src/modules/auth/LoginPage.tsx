import { useAuth } from '@modules/auth/hooks';
import { Navigate } from 'react-router-dom';

import { LoginForm } from './components';
import styles from './LoginPage.module.scss';

export const LoginPage = () => {
  const { state, signIn } = useAuth();

  if (state.status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return (
    <section className={styles.page} aria-labelledby="login-title">
      <div className={styles.heading}>
        <h1 className={styles.title} id="login-title">
          Вход в базу знаний
        </h1>

        <p className={styles.description}>Используйте тестовую учётную запись.</p>
      </div>

      <div className={styles.card}>
        <LoginForm onSubmit={signIn} />
      </div>
    </section>
  );
};
