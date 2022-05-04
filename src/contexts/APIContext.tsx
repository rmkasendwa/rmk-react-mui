import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { TAPIFunction } from '../interfaces';
import { useAuth } from './AuthContext';

export interface IAPIContext {
  call: <T extends TAPIFunction>(func: T) => Promise<ReturnType<T>>;
}
export const APIContext = createContext<IAPIContext>({
  call: async (apiFunction: TAPIFunction) => {
    return apiFunction();
  },
});

export const APIProvider: FC<{
  children: ReactNode;
  onSessionExpired: () => void;
}> = ({ children, onSessionExpired }) => {
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { clearLoggedInUserSession } = useAuth();

  const call = useCallback(
    async (apiCallback: TAPIFunction) => {
      return apiCallback().catch((err) => {
        if (
          [
            'User session timed out',
            'Session timed out',
            'Invalid token',
          ].includes(err.message)
        ) {
          clearLoggedInUserSession();
          setSessionExpired(true);
        } else {
          throw err;
        }
      });
    },
    [clearLoggedInUserSession]
  );

  useEffect(() => {
    if (sessionExpired) {
      onSessionExpired();
      setSessionExpired(false);
    }
  }, [navigate, onSessionExpired, pathname, search, sessionExpired]);

  return <APIContext.Provider value={{ call }}>{children}</APIContext.Provider>;
};
