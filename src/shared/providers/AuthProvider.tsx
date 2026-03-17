'use client';

import { authService } from '@shared/services/authService';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '@shared/types';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface AuthContextState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'alfred:auth';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthResponse;
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        // Si le parsing échoue, on supprime le token invalide
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const persist = useCallback((data: AuthResponse | null) => {
    if (typeof window === 'undefined') return;
    if (data) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleAuthSuccess = useCallback(
    (response: AuthResponse) => {
      setUser(response.user);
      setToken(response.token);
      persist(response);
      return response;
    },
    [persist]
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authService.login(payload);
      return handleAuthSuccess(response);
    },
    [handleAuthSuccess]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await authService.register(payload);
      return handleAuthSuccess(response);
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    persist(null);
  }, [persist]);

  const value = useMemo<AuthContextState>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
    }),
    [isLoading, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
