import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { login as apiLogin, logout as apiLogout } from '../api';
import { TPermissionCode } from '../interfaces/Users';
import StorageManager from '../utils/StorageManager';

export interface IAuthContext<T = any> {
  login: (
    username: string,
    password: string,
    loginFunction?: () => void
  ) => Promise<void>;
  logout: () => Promise<void>;
  loggedInUser: T | null;
  updateLoggedInUser: (user: T) => void;
  authenticated: boolean;
  clearLoggedInUserSession: () => void;
  loggedInUserHasPermission: (
    permissionCode: TPermissionCode | TPermissionCode[]
  ) => boolean;
  loadingCurrentSession: boolean;
  sessionExpired: boolean;
  setSessionExpired: Dispatch<SetStateAction<boolean>>;
}
export const AuthContext = createContext<IAuthContext>({} as any);

export const AuthProvider: FC<{
  children: ReactNode;
  value?: Record<string, any>;
}> = ({ children, value }) => {
  const [loggedInUser, setLoggedInUser] = useState<any | null>(null);
  const [loadingCurrentSession, setLoadingCurrentSession] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const user = StorageManager.get('user');
    setLoggedInUser(user);
    setLoadingCurrentSession(false);
  }, []);

  const updateLoggedInUserSession = useCallback((user: any) => {
    StorageManager.add('user', user);
    setLoggedInUser(user);
    setSessionExpired(false);
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

  const loggedInUserPermissions = useCallback(() => {
    if (loggedInUser && loggedInUser.permissions) {
      return loggedInUser.permissions;
    }
    return [];
  }, [loggedInUser]);

  const loggedInUserHasPermission = useCallback(
    (permissionCode: TPermissionCode | TPermissionCode[]) => {
      const permissions = loggedInUserPermissions();
      const isSuperAdmin = permissions.includes('ALL_FUNCTIONS');
      if (isSuperAdmin) {
        return isSuperAdmin;
      }
      if (Array.isArray(permissionCode)) {
        return permissionCode.some((permission) => {
          return permissions.includes(permission);
        });
      }
      return permissions.includes(permissionCode);
    },
    [loggedInUserPermissions]
  );

  useEffect(() => {
    if (sessionExpired) {
      clearLoggedInUserSession();
    }
  }, [clearLoggedInUserSession, sessionExpired]);

  return (
    <AuthContext.Provider
      value={{
        loggedInUser,
        login,
        logout,
        updateLoggedInUser,
        clearLoggedInUserSession,
        authenticated: loggedInUser !== null,
        loggedInUserHasPermission,
        loadingCurrentSession,
        sessionExpired,
        setSessionExpired,
        ...value,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
