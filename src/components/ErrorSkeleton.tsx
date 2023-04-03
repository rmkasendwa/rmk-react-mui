import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Skeleton, { SkeletonProps } from '@mui/material/Skeleton';
import useTheme from '@mui/material/styles/useTheme';
import { alpha } from '@mui/system/colorManipulator';
import clsx from 'clsx';
import { forwardRef } from 'react';

export interface ErrorSkeletonClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ErrorSkeletonClassKey = keyof ErrorSkeletonClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiErrorSkeleton: ErrorSkeletonProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiErrorSkeleton: keyof ErrorSkeletonClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiErrorSkeleton?: {
      defaultProps?: ComponentsProps['MuiErrorSkeleton'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiErrorSkeleton'];
      variants?: ComponentsVariants['MuiErrorSkeleton'];
    };
  }
}

export interface ErrorSkeletonProps extends SkeletonProps {}

export function getErrorSkeletonUtilityClass(slot: string): string {
  return generateUtilityClass('MuiErrorSkeleton', slot);
}

export const errorSkeletonClasses: ErrorSkeletonClasses =
  generateUtilityClasses('MuiErrorSkeleton', ['root']);

const slots = {
  root: ['root'],
};

export const ErrorSkeleton = forwardRef<HTMLDivElement, ErrorSkeletonProps>(
  function ErrorSkeleton(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiErrorSkeleton' });
    const { className, sx, ...rest } = props;

    const classes = composeClasses(
      slots,
      getErrorSkeletonUtilityClass,
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
      <Skeleton
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          bgcolor: alpha(palette.text.disabled, 0.05),
          ...sx,
        }}
        {...rest}
        animation={false}
      />
    );
  }
);

export default ErrorSkeleton;
