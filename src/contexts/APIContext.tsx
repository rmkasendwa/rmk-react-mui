import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { TAPIFunction } from '../interfaces/Utils';

export interface IAPIContext {
  call: <T extends TAPIFunction>(func: T) => Promise<ReturnType<T>>;
  sessionExpired: boolean;
}
export const APIContext = createContext<IAPIContext>({
  call: async (apiFunction: TAPIFunction) => {
    return apiFunction();
  },
  sessionExpired: false,
});

export const APIProvider: FC<{
  children: ReactNode;
  onSessionExpired: () => void;
}> = ({ children, onSessionExpired }) => {
  const [sessionExpired, setSessionExpired] = useState(false);

  const call = useCallback(
    async (apiCallback: TAPIFunction) => {
      return apiCallback()
        .then((response) => {
          setSessionExpired(false);
          return response;
        })
        .catch((err) => {
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

  return (
    <APIContext.Provider value={{ call, sessionExpired }}>
      {children}
    </APIContext.Provider>
  );
};

export const useAPIContext = () => {
  return useContext(APIContext);
};
