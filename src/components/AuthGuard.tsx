import * as queryString from 'query-string';
import { FC, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAPIContext } from '../contexts/APIContext';
import { useAuth } from '../contexts/AuthContext';
import {
  INDEX_PAGE_ROUTE_PATH,
  LOGIN_PAGE_ROUTE_PATH,
  LOGOUT_PAGE_ROUTE_PATH,
  SESSION_LOGIN_PAGE_ROUTE_PATH,
} from '../route-paths';

export interface AuthGuardProps {
  variant?: 'PROTECTED' | 'PUBLIC_ONLY' | 'PUBLIC';
}

const authenticationRoutePaths = [
  LOGIN_PAGE_ROUTE_PATH,
  SESSION_LOGIN_PAGE_ROUTE_PATH,
  LOGOUT_PAGE_ROUTE_PATH,
];

export const AuthGuard: FC<AuthGuardProps> = ({ variant }) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { sessionExpired } = useAPIContext();
  const { loggedInUser, authenticated, loadingCurrentSession } = useAuth();

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
                    !authenticationRoutePaths.includes(pathname)
                  ) {
                    return `?return_to=${encodeURIComponent(
                      pathname + search
                    )}`;
                  }
                  return '';
                })()
            );
          } else if (
            pathname === SESSION_LOGIN_PAGE_ROUTE_PATH &&
            !sessionExpired
          ) {
            navigate(
              (() => {
                if (search) {
                  return (queryString.parse(search || '') as any).return_to;
                }
                return INDEX_PAGE_ROUTE_PATH;
              })()
            );
          }
          break;
        case 'PUBLIC_ONLY':
          if (authenticated) {
            navigate(
              (() => {
                if (search) {
                  return (queryString.parse(search || '') as any).return_to;
                }
                return INDEX_PAGE_ROUTE_PATH;
              })()
            );
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
    sessionExpired,
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
