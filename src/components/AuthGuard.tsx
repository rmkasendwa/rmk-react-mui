import { FC, useEffect } from 'react';
import { Outlet, Path, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
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
  const navigate = useNavigate();
  const { loggedInUser, authenticated, loadingCurrentSession } = useAuth();

  useEffect(() => {
    if (!loadingCurrentSession) {
      switch (variant) {
        case 'PROTECTED':
          if (!loggedInUser) {
            const loginRoutePaths = [
              LOGIN_ROUTE_PATH,
              SESSION_LOGIN_ROUTE_PATH,
            ];
            const redirectConfig: Partial<Path> = {
              pathname: LOGIN_ROUTE_PATH,
            };
            if (
              location.pathname.length > 1 &&
              !loginRoutePaths.includes(location.pathname)
            ) {
              redirectConfig.search = `?return_to=${location.pathname}`;
            }
            navigate(redirectConfig, { state: { from: location } });
          }
          break;
        case 'PUBLIC_ONLY':
          if (authenticated) {
            navigate(INDEX_ROUTE_PATH, { state: { from: location } });
          }
          break;
      }
    }
  }, [
    authenticated,
    loadingCurrentSession,
    location,
    loggedInUser,
    navigate,
    variant,
  ]);

  return <Outlet />;
};

export default AuthGuard;
