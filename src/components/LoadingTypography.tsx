import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Skeleton,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Typography, { TypographyProps } from '@mui/material/Typography';
import clsx from 'clsx';
import { forwardRef } from 'react';

import { useLoadingContext } from '../contexts/LoadingContext';
import ErrorSkeleton from './ErrorSkeleton';

export interface LoadingTypographyClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type LoadingTypographyClassKey = keyof LoadingTypographyClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiLoadingTypography: LoadingTypographyProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiLoadingTypography: keyof LoadingTypographyClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiLoadingTypography?: {
      defaultProps?: ComponentsProps['MuiLoadingTypography'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiLoadingTypography'];
      variants?: ComponentsVariants['MuiLoadingTypography'];
    };
  }
}

export interface LoadingTypographyProps extends TypographyProps {}

export function getLoadingTypographyUtilityClass(slot: string): string {
  return generateUtilityClass('MuiLoadingTypography', slot);
}

export const loadingTypographyClasses: LoadingTypographyClasses =
  generateUtilityClasses('MuiLoadingTypography', ['root']);

const slots = {
  root: ['root'],
};

export const LoadingTypography = forwardRef<
  HTMLDivElement,
  LoadingTypographyProps
>(function LoadingTypography(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiLoadingTypography' });
  const { className, children, align, ...rest } = props;

  const classes = composeClasses(
    slots,
    getLoadingTypographyUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { loading, errorMessage } = useLoadingContext();
  const labelSkeletonWidth = String(children).length * 7;

  const loadingStateStyles = (() => {
    switch (align) {
      case 'center':
        return { mx: 'auto' };
      case 'right':
        return { ml: 'auto' };
      case 'justify':
        return { width: '100%' };
    }
  })();

  if (errorMessage) {
    return (
      <ErrorSkeleton
        sx={{
          width: labelSkeletonWidth,
          ...loadingStateStyles,
        }}
      />
    );
  }

  if (loading) {
    return (
      <Skeleton sx={{ width: labelSkeletonWidth, ...loadingStateStyles }} />
    );
  }

  return (
    <Typography
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...{ align }}
      {...rest}
    >
      {children}
    </Typography>
  );
});

export default LoadingTypography;
