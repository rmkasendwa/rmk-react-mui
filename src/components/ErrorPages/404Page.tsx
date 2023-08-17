import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef } from 'react';

import ErrorPage, { ErrorPageProps } from './ErrorPage';

export interface ResourceNotFoundPageClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ResourceNotFoundPageClassKey = keyof ResourceNotFoundPageClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiResourceNotFoundPage: ResourceNotFoundPageProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiResourceNotFoundPage: keyof ResourceNotFoundPageClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiResourceNotFoundPage?: {
      defaultProps?: ComponentsProps['MuiResourceNotFoundPage'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiResourceNotFoundPage'];
      variants?: ComponentsVariants['MuiResourceNotFoundPage'];
    };
  }
}
//#endregion

export const getResourceNotFoundPageUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiResourceNotFoundPage', slot);
};

const slots: Record<
  ResourceNotFoundPageClassKey,
  [ResourceNotFoundPageClassKey]
> = {
  root: ['root'],
};

export const resourceNotFoundPageClasses: ResourceNotFoundPageClasses =
  generateUtilityClasses(
    'MuiResourceNotFoundPage',
    Object.keys(slots) as ResourceNotFoundPageClassKey[]
  );

export interface ResourceNotFoundPageProps extends Partial<ErrorPageProps> {}

export const ResourceNotFoundPage = forwardRef<
  HTMLDivElement,
  ResourceNotFoundPageProps
>(function ResourceNotFoundPage(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiResourceNotFoundPage',
  });
  const { className, ...rest } = props;

  const classes = composeClasses(
    slots,
    getResourceNotFoundPageUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { palette } = useTheme();

  return (
    <ErrorPage
      ref={ref}
      className={clsx(classes.root)}
      title="Error 404 (Not Found)!!1"
      heading={<>Sorry, this page is not available</>}
      description={
        <>
          The requested URL{' '}
          <Typography
            component="strong"
            variant="inherit"
            sx={{
              color: palette.error.main,
              wordBreak: 'break-all',
            }}
          >
            {window.location.href}
          </Typography>{' '}
          was not found on this server.
        </>
      }
      errorCode="404"
      {...rest}
    />
  );
});

export default ResourceNotFoundPage;
