import {
  ComponentsProps,
  ComponentsVariants,
  useThemeProps,
} from '@mui/material';
import { FC, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAPIContext } from '../contexts/APIContext';
import { useAuth } from '../contexts/AuthContext';
import {
  INDEX_PAGE_ROUTE_PATH,
  LOGIN_PAGE_ROUTE_PATH,
  LOGOUT_PAGE_ROUTE_PATH,
  SESSION_LOGIN_PAGE_ROUTE_PATH,
} from '../route-paths';

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiAuthGuard: AuthGuardProps;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components {
    MuiAuthGuard?: {
      defaultProps?: ComponentsProps['MuiAuthGuard'];
      variants?: ComponentsVariants['MuiAuthGuard'];
    };
  }
}
//#endregion

export interface AuthGuardProps {
  variant?: 'PROTECTED' | 'PUBLIC_ONLY' | 'PUBLIC';
  indexPageRoutePath?: string;
  loginPageRoutePath?: string;
  sessionLoginPageRoutePath?: string;
  logoutPageRoutePath?: string;
}

export const AuthGuard: FC<AuthGuardProps> = (inProps) => {
  const props = useThemeProps({ props: inProps, name: 'MuiAuthGuard' });
  const {
    variant,
    indexPageRoutePath = INDEX_PAGE_ROUTE_PATH,
    loginPageRoutePath = LOGIN_PAGE_ROUTE_PATH,
    sessionLoginPageRoutePath = SESSION_LOGIN_PAGE_ROUTE_PATH,
    logoutPageRoutePath = LOGOUT_PAGE_ROUTE_PATH,
  } = props;

  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { sessionExpired } = useAPIContext();
  const { loggedInUser, loadingCurrentSession } = useAuth();

  const authenticationRoutePaths = useMemo(() => {
    return [loginPageRoutePath, sessionLoginPageRoutePath, logoutPageRoutePath];
  }, [loginPageRoutePath, logoutPageRoutePath, sessionLoginPageRoutePath]);

  useEffect(() => {
    if (!loadingCurrentSession) {
      switch (variant) {
        case 'PROTECTED':
          if (!loggedInUser) {
            navigate(
              loginPageRoutePath +
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
            pathname === sessionLoginPageRoutePath &&
            !sessionExpired
          ) {
            navigate(
              (() => {
                if (search) {
                  return Object.fromEntries(
                    new URLSearchParams(search).entries()
                  ).return_to;
                }
                return indexPageRoutePath;
              })()
            );
          }
          break;
        case 'PUBLIC_ONLY':
          if (loggedInUser) {
            navigate(
              (() => {
                if (search) {
                  return Object.fromEntries(
                    new URLSearchParams(search).entries()
                  ).return_to;
                }
                return indexPageRoutePath;
              })()
            );
          }
          break;
      }
    }
  }, [
    authenticationRoutePaths,
    indexPageRoutePath,
    loadingCurrentSession,
    loggedInUser,
    loginPageRoutePath,
    navigate,
    pathname,
    search,
    sessionExpired,
    sessionLoginPageRoutePath,
    variant,
  ]);

  if (
    (variant === 'PROTECTED' && !loggedInUser) ||
    (variant === 'PUBLIC_ONLY' && loggedInUser)
  ) {
    return null;
  }

  return <Outlet />;
};

export default AuthGuard;
