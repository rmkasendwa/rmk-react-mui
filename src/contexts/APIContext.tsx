import { FC, ReactNode, createContext, useCallback, useEffect } from 'react';

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
  const { setSessionExpired, sessionExpired } = useAuth();

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
          setSessionExpired(true);
        } else {
          throw err;
        }
      });
    },
    [setSessionExpired]
  );

  useEffect(() => {
    if (sessionExpired) {
      onSessionExpired();
    }
  }, [onSessionExpired, sessionExpired]);

  return <APIContext.Provider value={{ call }}>{children}</APIContext.Provider>;
};
