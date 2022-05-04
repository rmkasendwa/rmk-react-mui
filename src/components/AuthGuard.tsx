import { FC } from 'react';
import { Navigate, Outlet, Path, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts';
import {
  INDEX_ROUTE_PATH,
  LOGIN_ROUTE_PATH,
  SESSION_LOGIN_ROUTE_PATH,
} from '../route-paths';

export interface IAuthGuardProps {
  variant?: 'PROTECTED' | 'PUBLIC_ONLY' | 'PUBLIC';
}

export const AuthGuard: FC<IAuthGuardProps> = ({ variant }) => {
  const location = useLocation();
  const { loggedInUser, authenticated } = useAuth();

  switch (variant) {
    case 'PROTECTED':
      if (!loggedInUser) {
        const loginRoutePaths = [LOGIN_ROUTE_PATH, SESSION_LOGIN_ROUTE_PATH];
        const redirectConfig: Partial<Path> = {
          pathname: LOGIN_ROUTE_PATH,
        };
        if (
          location.pathname.length > 1 &&
          !loginRoutePaths.includes(location.pathname)
        ) {
          redirectConfig.search = `?return_to=${location.pathname}`;
        }
        return <Navigate to={redirectConfig} state={{ from: location }} />;
      }
      break;
    case 'PUBLIC_ONLY':
      if (authenticated) {
        return <Navigate to={INDEX_ROUTE_PATH} state={{ from: location }} />;
      }
      break;
  }

  return <Outlet />;
};

export default AuthGuard;
