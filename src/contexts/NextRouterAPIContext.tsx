import { useRouter } from 'next/router';
import { FC, ReactNode, createContext, useCallback } from 'react';

import { SESSION_LOGIN_PAGE_ROUTE_PATH } from '../route-paths';
import { APIProvider, IAPIContext } from './APIContext';
import { useBrowser } from './BrowserContext';

export interface NextRouterAPIContext extends IAPIContext {}
export const NextRouterAPIContext = createContext<NextRouterAPIContext>(
  {} as any
);

export const NextRouterAPIProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { push, asPath } = useRouter();
  const { browser } = useBrowser();

  const onSessionExpired = useCallback(() => {
    if (browser && asPath !== SESSION_LOGIN_PAGE_ROUTE_PATH) {
      push(
        SESSION_LOGIN_PAGE_ROUTE_PATH +
          `?return_to=${encodeURIComponent(asPath)}`
      );
    }
  }, [asPath, browser, push]);

  return <APIProvider {...{ onSessionExpired }}>{children}</APIProvider>;
};
