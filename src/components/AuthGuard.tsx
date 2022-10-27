import * as queryString from 'query-string';
import { FC, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAPIContext } from '../contexts/APIContext';
import { useAuth } from '../contexts/AuthContext';
import {
  INDEX_PAGE_ROUTE_PATH,
  LOGIN_PAGE_ROUTE_PATH,
  SESSION_LOGIN_PAGE_ROUTE_PATH,
} from '../route-paths';

export interface AuthGuardProps {
  variant?: 'PROTECTED' | 'PUBLIC_ONLY' | 'PUBLIC';
}

const loginRoutePaths = [LOGIN_PAGE_ROUTE_PATH, SESSION_LOGIN_PAGE_ROUTE_PATH];

export const AuthGuard: FC<AuthGuardProps> = ({ variant }) => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { sessionExpired } = useAPIContext();
  const { loggedInUser, authenticated, loadingCurrentSession } = useAuth();

  const sessionLogin =
    pathname === SESSION_LOGIN_PAGE_ROUTE_PATH && sessionExpired;

  useEffect(() => {
    if (!loadingCurrentSession) {
      switch (variant) {
        case 'PROTECTED':
          if (!loggedInUser) {
            navigate(
              LOGIN_PAGE_ROUTE_PATH +
                (() => {
                  if (
                    pathname.length > 1 &&
                    !loginRoutePaths.includes(pathname)
                  ) {
                    return `?return_to=${encodeURIComponent(
                      pathname + search
                    )}`;
                  }
                  return '';
                })()
            );
          }
          break;
        case 'PUBLIC_ONLY':
          if (authenticated && !sessionLogin) {
            const search = queryString.parse(location.search) as Record<
              string,
              string
            >;
            navigate(search.return_to ?? INDEX_PAGE_ROUTE_PATH);
          }
          break;
      }
    }
  }, [
    authenticated,
    loadingCurrentSession,
    loggedInUser,
    navigate,
    pathname,
    search,
    sessionLogin,
    variant,
  ]);

  if (
    (variant === 'PROTECTED' && !loggedInUser) ||
    (variant === 'PUBLIC_ONLY' && authenticated && !sessionLogin)
  ) {
    return null;
  }

  return <Outlet />;
};

export default AuthGuard;
