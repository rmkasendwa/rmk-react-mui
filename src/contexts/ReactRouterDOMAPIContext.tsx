import { FC, ReactNode, createContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { SESSION_LOGIN_PAGE_ROUTE_PATH } from '../route-paths';
import { APIProvider, IAPIContext } from './APIContext';

export interface IReactRouterDOMAPIContext extends IAPIContext {}
export const ReactRouterDOMAPIContext =
  createContext<IReactRouterDOMAPIContext>({} as any);

export const ReactRouterDOMAPIProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const onSessionExpired = useCallback(() => {
    if (pathname !== SESSION_LOGIN_PAGE_ROUTE_PATH) {
      navigate(
        SESSION_LOGIN_PAGE_ROUTE_PATH +
          `?return_to=${encodeURIComponent(pathname + search)}`
      );
    }
  }, [navigate, pathname, search]);

  return <APIProvider {...{ onSessionExpired }}>{children}</APIProvider>;
};
