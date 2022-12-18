import StorageManager from '@infinite-debugger/rmk-utils/StorageManager';
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useAPIService } from '../hooks/Utils';
import { PermissionCode } from '../interfaces/Users';
import { TAPIFunction } from '../interfaces/Utils';
import { useAPIContext } from './APIContext';

export interface LoggedInUser {
  id: string;
  permissions: PermissionCode[];
}

export interface AuthContext {
  login: (loginFunction: TAPIFunction<LoggedInUser>) => Promise<void>;
  logout: (logout?: () => void) => Promise<void>;
  loggedInUser: LoggedInUser | null;
  updateLoggedInUser: (user: LoggedInUser) => void;
  authenticated: boolean;
  clearLoggedInUserSession: () => void;
  loggedInUserHasPermission: (
    permissionCode: PermissionCode | PermissionCode[]
  ) => boolean;
  loadingCurrentSession: boolean;
  loggingIn: boolean;
  loginErrorMessage: string;
}
export const AuthContext = createContext<AuthContext>({} as any);

export const AuthProvider: FC<{
  children: ReactNode;
  value?: Record<string, any>;
}> = ({ children, value }) => {
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [loadingCurrentSession, setLoadingCurrentSession] = useState(true);
  const { setSessionExpired } = useAPIContext();
  const {
    record: user,
    load,
    loading: loggingIn,
    errorMessage: loginErrorMessage,
  } = useAPIService(loggedInUser);

  useEffect(() => {
    const user = StorageManager.get('user');
    setLoggedInUser(user);
    setLoadingCurrentSession(false);
  }, []);

  const updateLoggedInUserSession = useCallback(
    (user: LoggedInUser) => {
      setSessionExpired(false);
      StorageManager.add('user', user);
      setLoggedInUser(user);
    },
    [setSessionExpired]
  );

  const clearLoggedInUserSession = useCallback(() => {
    StorageManager.remove('user');
  }, []);

  const login = useCallback(
    async (loginFunction: TAPIFunction<LoggedInUser>) => {
      clearLoggedInUserSession();
      load(loginFunction);
    },
    [clearLoggedInUserSession, load]
  );

  const logoutRef = useRef(async (logout?: () => void) => {
    clearLoggedInUserSession();
    logout && (await logout());
    StorageManager.clear();
    setLoggedInUser(null);
  });

  const updateLoggedInUser = useCallback(
    (user: LoggedInUser) => {
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
    (permissionCode: PermissionCode | PermissionCode[]) => {
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
    if (user) {
      updateLoggedInUserSession(user);
    }
  }, [user, updateLoggedInUserSession]);

  return (
    <AuthContext.Provider
      value={{
        loggedInUser,
        login,
        logout: logoutRef.current,
        updateLoggedInUser,
        clearLoggedInUserSession,
        authenticated: loggedInUser !== null,
        loggedInUserHasPermission,
        loadingCurrentSession,
        loggingIn,
        loginErrorMessage,
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
