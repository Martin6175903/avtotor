import { Alert, Button } from '@components';
import { Outlet } from 'react-router-dom';

import { useAuth } from '../../hooks';
import styles from './SessionGate.module.scss';

export const SessionGate = () => {
  const { state, refreshSession } = useAuth();

  if (state.status === 'checking') {
    return <p role="status">Проверяем сессию...</p>;
  }

  if (state.status === 'error') {
    return (
      <div className={styles.message}>
        <Alert variant="error" announcement="assertive">
          {state.message}
        </Alert>

        <Button variant="secondary" onClick={() => void refreshSession()}>
          Повторить
        </Button>
      </div>
    );
  }

  return <Outlet />;
};
