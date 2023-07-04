import CloudSyncIcon from '@mui/icons-material/CloudSync';
import {
  Box,
  BoxProps,
  Button,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Stack,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { omit } from 'lodash';
import { singular } from 'pluralize';
import { FC, ReactNode, forwardRef } from 'react';
import { Link } from 'react-router-dom';

import ErrorAlert from './ErrorAlert';

export interface IconLoadingScreenClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type IconLoadingScreenClassKey = keyof IconLoadingScreenClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiIconLoadingScreen: IconLoadingScreenProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiIconLoadingScreen: keyof IconLoadingScreenClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiIconLoadingScreen?: {
      defaultProps?: ComponentsProps['MuiIconLoadingScreen'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiIconLoadingScreen'];
      variants?: ComponentsVariants['MuiIconLoadingScreen'];
    };
  }
}

export interface IconLoadingScreenProps extends Partial<BoxProps> {
  recordLabelPlural?: string;
  recordLabelSingular?: string;
  noRecordsStatement?: string;
  recordsCount?: number;
  pathToAddNew?: string;
  Icon?: FC<any>;
  LoadingIcon?: FC<any>;
  loading?: boolean;
  message?: ReactNode;
  isLoadingMessage?: ReactNode;
  isLoadedMessage?: ReactNode;
  isLoaded?: boolean;
  errorMessage?: string;
  load?: () => void;
  addNewButtonLabel?: ReactNode;
}

export function getIconLoadingScreenUtilityClass(slot: string): string {
  return generateUtilityClass('MuiIconLoadingScreen', slot);
}

export const iconLoadingScreenClasses: IconLoadingScreenClasses =
  generateUtilityClasses('MuiIconLoadingScreen', ['root']);

const slots = {
  root: ['root'],
};

export const IconLoadingScreen = forwardRef<any, IconLoadingScreenProps>(
  function IconLoadingScreen(inProps, ref) {
    const props = useThemeProps({
      props: inProps,
      name: 'MuiIconLoadingScreen',
    });
    const {
      className,
      recordLabelPlural = 'Records',
      recordsCount,
      pathToAddNew = '',
      Icon = CloudSyncIcon,
      LoadingIcon,
      loading,
      errorMessage,
      load,
      message,
      isLoadingMessage,
      isLoadedMessage,
      isLoaded,
      ...rest
    } = omit(
      props,
      'recordLabelSingular',
      'noRecordsStatement',
      'addNewButtonLabel'
    );

    let { recordLabelSingular, noRecordsStatement, addNewButtonLabel } = props;

    const classes = composeClasses(
      slots,
      getIconLoadingScreenUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    recordLabelSingular || (recordLabelSingular = singular(recordLabelPlural));

    const lowercaseRecordLabelPlural = recordLabelPlural.toLowerCase();
    const lowercaseRecordLabelSingular = recordLabelSingular.toLowerCase();
    noRecordsStatement ||
      (noRecordsStatement = `Add ${lowercaseRecordLabelSingular}.`);

    addNewButtonLabel || (addNewButtonLabel = `Add New ${recordLabelSingular}`);

    return (
      <Box
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          height: '100%',
          minHeight: 200,
        }}
      >
        <Stack sx={{ alignItems: 'center', gap: 1 }}>
          {(() => {
            if (loading && LoadingIcon) {
              return (
                <LoadingIcon
                  sx={{
                    fontSize: 48,
                  }}
                />
              );
            }
            return (
              <Icon
                sx={{
                  fontSize: 48,
                }}
              />
            );
          })()}
          {(() => {
            if (loading) {
              return (
                <Typography align="center" variant="body2">
                  {(() => {
                    if (isLoadingMessage) {
                      return isLoadingMessage;
                    }
                    return (
                      <>Loading {lowercaseRecordLabelPlural}, please wait...</>
                    );
                  })()}
                </Typography>
              );
            }
            if (errorMessage) {
              return <ErrorAlert message={errorMessage} retry={load} />;
            }
            if (isLoaded) {
              return (
                <Typography align="center" variant="body2">
                  {(() => {
                    if (isLoadedMessage) {
                      return isLoadedMessage;
                    }
                    return <>{recordLabelPlural} loaded successfully</>;
                  })()}
                </Typography>
              );
            }
            if (pathToAddNew) {
              return (
                <>
                  <Typography
                    align="center"
                    sx={{
                      fontWeight: 500,
                      fontSize: 22,
                    }}
                  >
                    {noRecordsStatement}
                  </Typography>
                  <Button
                    variant="contained"
                    component={Link}
                    to={pathToAddNew}
                    size="small"
                  >
                    {addNewButtonLabel}
                  </Button>
                </>
              );
            }
            if (recordsCount != null && recordsCount <= 0) {
              return (
                <Typography align="center" variant="body2">
                  No {lowercaseRecordLabelPlural} found.
                </Typography>
              );
            }
            if (message) {
              return (
                <Typography align="center" variant="body2">
                  {message}
                </Typography>
              );
            }
          })()}
        </Stack>
      </Box>
    );
  }
);

export default IconLoadingScreen;
