import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import { forwardRef } from 'react';

export interface ReloadIconButtonClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ReloadIconButtonClassKey = keyof ReloadIconButtonClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiReloadIconButton: ReloadIconButtonProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiReloadIconButton: keyof ReloadIconButtonClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiReloadIconButton?: {
      defaultProps?: ComponentsProps['MuiReloadIconButton'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiReloadIconButton'];
      variants?: ComponentsVariants['MuiReloadIconButton'];
    };
  }
}

export interface ReloadIconButtonProps
  extends Omit<BoxProps, 'title' | 'children'> {
  loading?: boolean;
  errorMessage?: string;
  load?: () => void;
  IconButtonProps?: Partial<Omit<IconButtonProps, 'onClick'>>;
}

export function getReloadIconButtonUtilityClass(slot: string): string {
  return generateUtilityClass('MuiReloadIconButton', slot);
}

export const reloadIconButtonClasses: ReloadIconButtonClasses =
  generateUtilityClasses('MuiReloadIconButton', ['root']);

const slots = {
  root: ['root'],
};

export const ReloadIconButton = forwardRef<
  HTMLDivElement,
  ReloadIconButtonProps
>(function ReloadIconButton(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiReloadIconButton' });
  const {
    className,
    loading = false,
    load,
    errorMessage,
    IconButtonProps = {},
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getReloadIconButtonUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { sx: IconButtonPropsSx, ...IconButtonPropsRest } = IconButtonProps;

  return (
    <Box ref={ref} {...rest} className={clsx(classes.root)}>
      {(() => {
        if (loading) {
          return (
            <IconButton
              {...IconButtonPropsRest}
              disabled
              sx={{
                color: 'inherit !important',
                ...IconButtonPropsSx,
              }}
            >
              <CircularProgress size={24} color="inherit" />
            </IconButton>
          );
        }
        const refreshButton = (
          <Tooltip title="Refresh">
            <IconButton
              {...IconButtonPropsRest}
              onClick={() => load && load()}
              sx={{
                color: 'inherit !important',
                ...IconButtonPropsSx,
              }}
            >
              <RefreshIcon color="inherit" sx={{ display: 'block' }} />
            </IconButton>
          </Tooltip>
        );
        if (errorMessage) {
          return (
            <Grid
              container
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'nowrap',
              }}
            >
              <Grid item display="flex">
                <Tooltip title={errorMessage}>
                  <ErrorIcon color="error" />
                </Tooltip>
              </Grid>
              <Grid item>{refreshButton}</Grid>
            </Grid>
          );
        }
        return refreshButton;
      })()}
    </Box>
  );
});

export default ReloadIconButton;
