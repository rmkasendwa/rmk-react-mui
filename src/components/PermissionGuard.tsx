import {
  ComponentsProps,
  ComponentsVariants,
  generateUtilityClass,
  useThemeProps,
} from '@mui/material';
import { FC, ReactNode } from 'react';

import { useAuth } from '../contexts/AuthContext';
import AccessDeniedPage from './ErrorPages/403Page';

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiPermissionGuard: PermissionGuardProps;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components {
    MuiPermissionGuard?: {
      defaultProps?: ComponentsProps['MuiPermissionGuard'];
      variants?: ComponentsVariants['MuiPermissionGuard'];
    };
  }
}
//#endregion

export const getPermissionGuardUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiPermissionGuard', slot);
};

export interface PermissionGuardProps {
  permission: string | string[];
  fallbackComponent?: ReactNode;
  showFallbackComponent?: boolean;
  children: ReactNode;
}

export const PermissionGuard: FC<PermissionGuardProps> = (inProps) => {
  const props = useThemeProps({ props: inProps, name: 'MuiPermissionGuard' });
  const {
    permission,
    fallbackComponent = <AccessDeniedPage />,
    showFallbackComponent = true,
    children,
  } = props;

  const { loggedInUserHasPermission, loadingCurrentSession } = useAuth();
  if (loadingCurrentSession) {
    return null;
  }
  if (loggedInUserHasPermission(permission)) {
    return <>{children}</>;
  }
  if (showFallbackComponent) {
    return <>{fallbackComponent}</>;
  }
  return null;
};

export default PermissionGuard;
