import { FC, ReactNode, createContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { TAPIFunction } from '../interfaces';
import { SESSION_LOGIN_ROUTE_PATH } from '../route-paths';
import { APIProvider, IAPIContext } from './APIContext';

export interface IClientSideAPIContext extends IAPIContext {}
export const ClientSideAPIContext = createContext<IClientSideAPIContext>({
  call: async (apiFunction: TAPIFunction) => {
    return apiFunction();
  },
});

export const ClientSideAPIProvider: FC<{
  children: ReactNode;
  onSessionExpired: () => void;
}> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const onSessionExpired = useCallback(() => {
    navigate(
      SESSION_LOGIN_ROUTE_PATH +
        `?return_to=${encodeURIComponent(pathname + search)}`
    );
  }, [navigate, pathname, search]);

  return <APIProvider {...{ onSessionExpired }}>{children}</APIProvider>;
};
