import { useRouter } from 'next/router';
import { FC, ReactNode, createContext, useCallback } from 'react';

import { SESSION_LOGIN_ROUTE_PATH } from '../route-paths';
import { APIProvider, IAPIContext } from './APIContext';
import { useBrowser } from './BrowserContext';

export interface IServerSideAPIContext extends IAPIContext {}
export const ServerSideAPIContext = createContext<IServerSideAPIContext>(
  {} as any
);

export const ServerSideAPIProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { push, asPath } = useRouter();
  const { browser } = useBrowser();

  const onSessionExpired = useCallback(() => {
    if (browser && asPath !== SESSION_LOGIN_ROUTE_PATH) {
      push(
        SESSION_LOGIN_ROUTE_PATH + `?return_to=${encodeURIComponent(asPath)}`
      );
    }
  }, [asPath, browser, push]);

  return <APIProvider {...{ onSessionExpired }}>{children}</APIProvider>;
};
