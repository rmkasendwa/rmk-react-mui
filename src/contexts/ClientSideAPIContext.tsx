import { FC, ReactNode, createContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { SESSION_LOGIN_ROUTE_PATH } from '../route-paths';
import { APIProvider, IAPIContext } from './APIContext';

export interface IClientSideAPIContext extends IAPIContext {}
export const ClientSideAPIContext = createContext<IClientSideAPIContext>(
  {} as any
);

export const ClientSideAPIProvider: FC<{
  children: ReactNode;
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
