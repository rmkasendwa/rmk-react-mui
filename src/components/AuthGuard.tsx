import * as queryString from 'query-string';
import { FC, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import {
  INDEX_ROUTE_PATH,
  LOGIN_ROUTE_PATH,
  SESSION_LOGIN_ROUTE_PATH,
} from '../route-paths';

export interface IAuthGuardProps {
  variant?: 'PROTECTED' | 'PUBLIC_ONLY' | 'PUBLIC';
}

const loginRoutePaths = [LOGIN_ROUTE_PATH, SESSION_LOGIN_ROUTE_PATH];

export const AuthGuard: FC<IAuthGuardProps> = ({ variant }) => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { loggedInUser, authenticated, loadingCurrentSession } = useAuth();

  useEffect(() => {
    if (!loadingCurrentSession) {
      switch (variant) {
        case 'PROTECTED':
          if (!loggedInUser) {
            navigate(
              LOGIN_ROUTE_PATH +
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
          if (authenticated) {
            const search = queryString.parse(location.search) as Record<
              string,
              string
            >;
            navigate(search.return_to ?? INDEX_ROUTE_PATH);
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
    variant,
  ]);

  if (
    (variant === 'PROTECTED' && !loggedInUser) ||
    (variant === 'PUBLIC_ONLY' && authenticated)
  ) {
    return null;
  }

  return <Outlet />;
};

export default AuthGuard;
