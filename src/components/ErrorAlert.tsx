import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Alert, { AlertProps, alertClasses } from '@mui/material/Alert';
import clsx from 'clsx';
import { forwardRef } from 'react';

import RetryErrorMessage, { RetryErrorMessageProps } from './RetryErrorMessage';

export interface ErrorAlertClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ErrorAlertClassKey = keyof ErrorAlertClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiErrorAlert: ErrorAlertProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiErrorAlert: keyof ErrorAlertClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiErrorAlert?: {
      defaultProps?: ComponentsProps['MuiErrorAlert'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiErrorAlert'];
      variants?: ComponentsVariants['MuiErrorAlert'];
    };
  }
}
//#endregion

export const getErrorAlertUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiErrorAlert', slot);
};

const slots: Record<ErrorAlertClassKey, [ErrorAlertClassKey]> = {
  root: ['root'],
};

export const errorAlertClasses: ErrorAlertClasses = generateUtilityClasses(
  'MuiErrorAlert',
  Object.keys(slots) as ErrorAlertClassKey[]
);

export interface ErrorAlertProps extends RetryErrorMessageProps, AlertProps {
  dismissErrorMessage?: () => void;
}

export const ErrorAlert = forwardRef<HTMLDivElement, ErrorAlertProps>(
  function ErrorAlert(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiErrorAlert' });
    const { className, message, dismissErrorMessage, retry, sx, ...rest } =
      props;

    const classes = composeClasses(
      slots,
      getErrorAlertUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    return (
      <Alert
        ref={ref}
        {...rest}
        {...(() => {
          if (dismissErrorMessage) {
            return {
              onClose: dismissErrorMessage,
            };
          }
        })()}
        className={clsx(classes.root)}
        severity="error"
        sx={[
          {
            width: '100%',
            boxSizing: 'border-box',
            whiteSpace: 'pre-wrap',
            [`& .${alertClasses.message}`]: {
              overflow: 'hidden',
            },
          },
          sx as any,
        ]}
      >
        <RetryErrorMessage {...{ message, retry }} />
      </Alert>
    );
  }
);

export default ErrorAlert;
