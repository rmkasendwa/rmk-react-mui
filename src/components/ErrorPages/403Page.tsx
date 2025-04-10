import ReportIcon from '@mui/icons-material/Report';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef } from 'react';

import ErrorPage, { ErrorPageProps } from './ErrorPage';

export interface AccessDeniedPageClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type AccessDeniedPageClassKey = keyof AccessDeniedPageClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiAccessDeniedPage: AccessDeniedPageProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiAccessDeniedPage: keyof AccessDeniedPageClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiAccessDeniedPage?: {
      defaultProps?: ComponentsProps['MuiAccessDeniedPage'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiAccessDeniedPage'];
      variants?: ComponentsVariants['MuiAccessDeniedPage'];
    };
  }
}
//#endregion

export const getAccessDeniedPageUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiAccessDeniedPage', slot);
};

const slots: Record<AccessDeniedPageClassKey, [AccessDeniedPageClassKey]> = {
  root: ['root'],
};

export const accessDeniedPageClasses: AccessDeniedPageClasses =
  generateUtilityClasses(
    'MuiAccessDeniedPage',
    Object.keys(slots) as AccessDeniedPageClassKey[]
  );

export type AccessDeniedPageProps = Partial<ErrorPageProps>;

export const AccessDeniedPage = forwardRef<
  HTMLDivElement,
  AccessDeniedPageProps
>(function AccessDeniedPage(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiAccessDeniedPage',
  });
  const { className, ...rest } = props;

  const classes = composeClasses(
    slots,
    getAccessDeniedPageUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  return (
    <ErrorPage
      ref={ref}
      className={clsx(classes.root)}
      heading={<>We&rsquo;re sorry, but you do not have access to this page.</>}
      errorCode={
        <ReportIcon
          sx={{
            fontSize: 200,
          }}
        />
      }
      {...rest}
    />
  );
});

export default AccessDeniedPage;
