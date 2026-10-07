import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks';
import { UserControls } from '..';

export const SessionControls = () => {
  const { state } = useAuth();

  if (state.status === 'authenticated') {
    return <UserControls key={`${state.user.id}:${state.user.role}`} user={state.user} />;
  }

  if (state.status === 'anonymous') {
    return <Link to="/login">Войти</Link>;
  }

  return null;
};
