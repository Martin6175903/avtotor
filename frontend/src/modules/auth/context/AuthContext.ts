import { createContext } from 'react';

import { LoginRequest } from '../api';
import { AuthState } from './AuthContext.types';

type AuthContextValue = {
  state: AuthState;
  signIn: (credentials: LoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  expireSession: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
