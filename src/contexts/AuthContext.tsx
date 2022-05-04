import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { login as apiLogin, logout as apiLogout } from '../api';
import StorageManager from '../utils/StorageManager';

export interface IAuthContext {
  login: (
    username: string,
    password: string,
    loginFunction?: () => void
  ) => Promise<void>;
  logout: () => Promise<void>;
  loggedInUser: any;
  updateLoggedInUser: (user: any) => void;
  authenticated: boolean;
  clearLoggedInUserSession: () => void;
}
export const AuthContext = createContext<IAuthContext>({} as any);

export const AuthProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState<any | null>(null);

  useEffect(() => {
    const user = StorageManager.get('user');
    setLoggedInUser(user);
  }, []);

  const updateLoggedInUserSession = useCallback((user: any) => {
    StorageManager.add('user', user);
    setLoggedInUser(user);
  }, []);

  const clearLoggedInUserSession = useCallback(() => {
    StorageManager.remove('user');
  }, []);

  const login = useCallback(
    async (
      username: string,
      password: string,
      loginFunction = apiLogin
    ): Promise<void> => {
      clearLoggedInUserSession();
      const user = await loginFunction(username, password);
      user && updateLoggedInUserSession(user);
    },
    [clearLoggedInUserSession, updateLoggedInUserSession]
  );

  const logout = useCallback(async () => {
    clearLoggedInUserSession();
    apiLogout();
    StorageManager.clear();
    setLoggedInUser(null);
  }, [clearLoggedInUserSession]);

  const updateLoggedInUser = useCallback(
    (user: any) => {
      updateLoggedInUserSession(user);
    },
    [updateLoggedInUserSession]
  );

  return (
    <AuthContext.Provider
      value={{
        loggedInUser,
        login,
        logout,
        updateLoggedInUser,
        clearLoggedInUserSession,
        authenticated: loggedInUser !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
