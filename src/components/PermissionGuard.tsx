import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import { FC, ReactNode } from 'react';

import { useAuth } from '../contexts/AuthContext';
import AccessDeniedPage from './ErrorPages/403Page';

export interface PermissionGuardClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type PermissionGuardClassKey = keyof PermissionGuardClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiPermissionGuard: PermissionGuardProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiPermissionGuard: keyof PermissionGuardClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiPermissionGuard?: {
      defaultProps?: ComponentsProps['MuiPermissionGuard'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiPermissionGuard'];
      variants?: ComponentsVariants['MuiPermissionGuard'];
    };
  }
}

export interface PermissionGuardProps {
  permission: string | string[];
  fallbackComponent?: ReactNode;
  showFallbackComponent?: boolean;
  children: ReactNode;
}

export function getPermissionGuardUtilityClass(slot: string): string {
  return generateUtilityClass('MuiPermissionGuard', slot);
}

export const PermissionGuardClasses: PermissionGuardClasses =
  generateUtilityClasses('MuiPermissionGuard', ['root']);

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
