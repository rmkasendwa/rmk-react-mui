import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Button,
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

import { LOGOUT_PAGE_ROUTE_PATH } from '../../route-paths';
import ErrorPage, { ErrorPageProps } from './ErrorPage';

export interface InternalErrorPageClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type InternalErrorPageClassKey = keyof InternalErrorPageClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiInternalErrorPage: InternalErrorPageProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiInternalErrorPage: keyof InternalErrorPageClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiInternalErrorPage?: {
      defaultProps?: ComponentsProps['MuiInternalErrorPage'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiInternalErrorPage'];
      variants?: ComponentsVariants['MuiInternalErrorPage'];
    };
  }
}

export interface InternalErrorPageProps extends Partial<ErrorPageProps> {}

export function getInternalErrorPageUtilityClass(slot: string): string {
  return generateUtilityClass('MuiInternalErrorPage', slot);
}

export const resourceNotFoundPageClasses: InternalErrorPageClasses =
  generateUtilityClasses('MuiInternalErrorPage', ['root']);

const slots = {
  root: ['root'],
};

export const InternalErrorPage = forwardRef<
  HTMLDivElement,
  InternalErrorPageProps
>(function InternalErrorPage(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiInternalErrorPage',
  });
  const { className, ...rest } = props;

  const classes = composeClasses(
    slots,
    getInternalErrorPageUtilityClass,
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
      title="Error 500 (Internal Server Error)!!1"
      heading={<>We&rsquo;re sorry, something went wrong.</>}
      errorCode="500"
      tools={
        <Button href={LOGOUT_PAGE_ROUTE_PATH} startIcon={<RefreshIcon />}>
          Take me away from here
        </Button>
      }
      {...rest}
    />
  );
});

export default InternalErrorPage;
