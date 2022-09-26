import { FC, ReactNode } from 'react';

import { useAuth } from '../contexts/AuthContext';

export interface IPermissionGuardProps {
  permission: string | string[];
  fallbackComponent?: ReactNode;
  children: ReactNode;
}

export const PermissionGuard: FC<IPermissionGuardProps> = ({
  permission,
  fallbackComponent,
  children,
}) => {
  const { loggedInUserHasPermission, loadingCurrentSession } = useAuth();
  if (loadingCurrentSession) {
    return null;
  }
  if (loggedInUserHasPermission(permission)) {
    return <>{children}</>;
  }
  return <>{fallbackComponent}</>;
};

export default PermissionGuard;
