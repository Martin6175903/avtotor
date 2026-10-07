import { demoSubmission } from '@utils';

import { LoginForm } from './components';
import styles from './LoginPage.module.scss';

export const LoginPage = () => {
  return (
    <section className={styles.page} aria-labelledby="login-title">
      <div className={styles.heading}>
        <h1 className={styles.title} id="login-title">
          Вход в базу знаний
        </h1>

        <p className={styles.description}>Используйте тестовую учётную запись.</p>
      </div>

      <div className={styles.card}>
        <LoginForm onSubmit={demoSubmission} />
      </div>
    </section>
  );
};
