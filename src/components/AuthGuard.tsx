import { FC } from 'react';
import { Navigate, Outlet, Path, useLocation } from 'react-router-dom';

import Auth from '../auth';
import { INDEX_ROUTE_PATH, LOGIN_ROUTE_PATH } from '../route-paths';

export interface IAuthGuardProps {
  variant?: 'PROTECTED' | 'PUBLIC_ONLY' | 'PUBLIC';
}

export const AuthGuard: FC<IAuthGuardProps> = ({ variant }) => {
  const location = useLocation();

  switch (variant) {
    case 'PROTECTED':
      if (!Auth.loggedInUser()) {
        const redirectConfig: Partial<Path> = {
          pathname: LOGIN_ROUTE_PATH,
        };
        if (location.pathname.length > 1) {
          redirectConfig.search = `?return_to=${location.pathname}`;
        }
        return <Navigate to={redirectConfig} state={{ from: location }} />;
      }
      break;
    case 'PUBLIC_ONLY':
      if (Auth.isAuthenticated()) {
        return <Navigate to={INDEX_ROUTE_PATH} state={{ from: location }} />;
      }
      break;
  }

  return <Outlet />;
};

export default AuthGuard;
