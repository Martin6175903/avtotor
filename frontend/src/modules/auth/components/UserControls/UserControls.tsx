import { Alert, Button } from '@components';
import { ApiError } from '@services';
import { useState } from 'react';

import { useAuth } from '../../hooks';
import { ROLE_LABELS } from './UserControls.constants';
import styles from './UserControls.module.scss';
import { UserControlsProps } from './UserControls.types';

export const UserControls = ({ user }: UserControlsProps) => {
  const { signOut } = useAuth();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setError(null);
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      setError(error instanceof ApiError ? error.message : 'Не удалось выйти. Попробуйте ещё раз.');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.identity}>
          <span>{user.name}</span>
          <span className={styles.role}>{ROLE_LABELS[user.role]}</span>
        </div>

        <Button
          variant="secondary"
          isLoading={isSigningOut}
          loadingText="Выходим…"
          onClick={handleLogout}
        >
          Выйти
        </Button>
      </div>

      {error && (
        <Alert variant="error" announcement="assertive">
          {error}
        </Alert>
      )}
    </div>
  );
};
