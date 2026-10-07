import { ApiError } from '@services/http';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getCurrentUser, login, type LoginRequest, logout } from '../api';
import { AuthContext, type AuthState } from '.';
import { AuthProviderProps } from './AuthProvider.types';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    status: 'checking',
  });

  const activeRequest = useRef<AbortController | null>(null);

  const startRequest = useCallback(() => {
    activeRequest.current?.abort();

    const controller = new AbortController();
    activeRequest.current = controller;

    return controller;
  }, []);

  const expireSession = useCallback(() => {
    activeRequest.current?.abort();

    setState({
      status: 'anonymous',
    });
  }, []);

  const refreshSession = useCallback(async () => {
    const controller = startRequest();

    setState({
      status: 'checking',
    });

    try {
      const user = await getCurrentUser(controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      setState({
        status: 'authenticated',
        user,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        setState({
          status: 'anonymous',
        });

        return;
      }

      setState({
        status: 'error',
        message: error instanceof ApiError ? error.message : 'Не удалось проверить сессию.',
      });
    }
  }, [startRequest]);

  const signIn = useCallback(
    async (credentials: LoginRequest) => {
      const controller = startRequest();

      try {
        const user = await login(credentials, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: 'authenticated',
          user,
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          throw error;
        }
      }
    },
    [startRequest],
  );

  const signOut = useCallback(async () => {
    const controller = startRequest();

    try {
      await logout(controller.signal);
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      if (!(error instanceof ApiError && error.status === 401)) {
        throw error;
      }
    }

    if (!controller.signal.aborted) {
      setState({
        status: 'anonymous',
      });
    }
  }, [startRequest]);

  useEffect(() => {
    void refreshSession();

    return () => {
      activeRequest.current?.abort();
    };
  }, [refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        state,
        signIn,
        signOut,
        refreshSession,
        expireSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
