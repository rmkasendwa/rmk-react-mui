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

import { TAPIFunction } from '../interfaces/Utils';
import { REDIRECTION_ERROR_MESSAGES } from '../utils/JWT';

export interface IAPIContext {
  call: <T extends TAPIFunction>(func: T) => Promise<ReturnType<T>>;
  sessionExpired: boolean;
  setSessionExpired: Dispatch<SetStateAction<boolean>>;
}
export const APIContext = createContext<IAPIContext>({} as any);

export const APIProvider: FC<{
  children: ReactNode;
  onSessionExpired: () => void;
}> = ({ children, onSessionExpired }) => {
  const [sessionExpired, setSessionExpired] = useState(false);

  const call = useCallback(
    async (apiCallback: TAPIFunction) => {
      return apiCallback().catch((err) => {
        if (REDIRECTION_ERROR_MESSAGES.includes(err.message)) {
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
    <APIContext.Provider value={{ call, sessionExpired, setSessionExpired }}>
      {children}
    </APIContext.Provider>
  );
};

export const useAPIContext = () => {
  return useContext(APIContext);
};
