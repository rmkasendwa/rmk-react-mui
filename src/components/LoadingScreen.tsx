import {
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import clsx from 'clsx';
import { forwardRef } from 'react';

export interface LoadingScreenClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type LoadingScreenClassKey = keyof LoadingScreenClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiLoadingScreen: LoadingScreenProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiLoadingScreen: keyof LoadingScreenClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiLoadingScreen?: {
      defaultProps?: ComponentsProps['MuiLoadingScreen'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiLoadingScreen'];
      variants?: ComponentsVariants['MuiLoadingScreen'];
    };
  }
}
//#endregion

export const getLoadingScreenUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiLoadingScreen', slot);
};

const slots: Record<LoadingScreenClassKey, [LoadingScreenClassKey]> = {
  root: ['root'],
};

export const loadingScreenClasses: LoadingScreenClasses =
  generateUtilityClasses(
    'MuiLoadingScreen',
    Object.keys(slots) as LoadingScreenClassKey[]
  );

export interface LoadingScreenProps extends Partial<BoxProps> {
  absolute?: boolean;
}

export const LoadingScreen = forwardRef<HTMLDivElement, LoadingScreenProps>(
  function LoadingScreen(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiLoadingScreen' });
    const { className, absolute, sx, ...rest } = props;

    const classes = composeClasses(
      slots,
      getLoadingScreenUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    return (
      <Box
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          ...(() => {
            if (absolute) {
              return {
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
              };
            }
            return {
              height: 200,
            };
          })(),
          ...sx,
        }}
      >
        <CircularProgress size={60} sx={{ mt: 1 }} />
      </Box>
    );
  }
);

export default LoadingScreen;
