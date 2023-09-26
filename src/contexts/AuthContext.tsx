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

import { useAPIService } from '../hooks/DataFetching';
import { PermissionCode } from '../models/Users';
import { APIFunction } from '../models/Utils';
import { useAPIContext } from './APIContext';
import { useLocalStorageData } from './LocalStorageDataContext';

export interface LoggedInUser {
  id: string;
  permissions: PermissionCode[];
}

export interface AuthContext {
  login: (loginFunction: APIFunction<LoggedInUser>) => Promise<void>;
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
  const { sessionExpired, setSessionExpired } = useAPIContext();
  const { reset: resetCachedData } = useLocalStorageData();
  const {
    record: user,
    load,
    loading: loggingIn,
    errorMessage: loginErrorMessage,
  } = useAPIService(loggedInUser);

  useEffect(() => {
    if (!sessionExpired) {
      const focusCallback = async () => {
        setLoggedInUser((prevLoggedInUser) => {
          const sessionUser = StorageManager.get('user');
          if (
            JSON.stringify(sessionUser) !== JSON.stringify(prevLoggedInUser)
          ) {
            return sessionUser;
          }
          return prevLoggedInUser;
        });
        setLoadingCurrentSession(false);
      };
      window.addEventListener('focus', focusCallback);
      focusCallback();
      return () => {
        window.removeEventListener('focus', focusCallback);
      };
    }
  }, [sessionExpired]);

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
    async (loginFunction: APIFunction<LoggedInUser>) => {
      clearLoggedInUserSession();
      load(loginFunction);
    },
    [clearLoggedInUserSession, load]
  );

  const logoutRef = useRef(async (logout?: () => void) => {
    clearLoggedInUserSession();
    logout && (await logout());
    await resetCachedData();
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
