import { FC, createContext, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { clearLoggedInUserSession } from '../auth';
import { IAPIFunction } from '../interfaces';
import { SESSION_LOGIN_ROUTE_PATH } from '../route-paths';

export interface IAPIContext {
  call: <T extends IAPIFunction>(func: T) => Promise<ReturnType<T>>;
}
export const APIContext = createContext<IAPIContext>({
  call: async (apiFunction: IAPIFunction) => {
    return apiFunction();
  },
});

export const APIProvider: FC = ({ children }) => {
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const call = useCallback(async (apiCallback: IAPIFunction) => {
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
  }, []);

  useEffect(() => {
    if (sessionExpired) {
      navigate(
        SESSION_LOGIN_ROUTE_PATH +
          `?return_to=${encodeURIComponent(pathname + search)}`
      );
      setSessionExpired(false);
    }
  }, [navigate, pathname, search, sessionExpired]);

  return <APIContext.Provider value={{ call }}>{children}</APIContext.Provider>;
};
