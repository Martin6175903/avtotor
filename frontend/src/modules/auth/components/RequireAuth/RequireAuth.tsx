import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../hooks';

export const RequireAuth = () => {
  const { state } = useAuth();

  if (state.status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet key={`${state.user.id}:${state.user.role}`} />;
};
