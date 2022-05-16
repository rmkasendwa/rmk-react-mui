import { FC, ReactNode } from 'react';

import { useAuth } from '../contexts';

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
  const { loggedUserHasPermission, loadingCurrentSession } = useAuth();
  if (loadingCurrentSession) {
    return null;
  }
  if (loggedUserHasPermission(permission)) {
    return <>{children}</>;
  }
  return <>{fallbackComponent}</>;
};

export default PermissionGuard;
