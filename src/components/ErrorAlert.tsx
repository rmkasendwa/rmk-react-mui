import Alert, { AlertProps, alertClasses } from '@mui/material/Alert';
import { FC } from 'react';

import RetryErrorMessage, { RetryErrorMessageProps } from './RetryErrorMessage';

export interface ErrorAlertProps extends RetryErrorMessageProps, AlertProps {}

export const ErrorAlert: FC<ErrorAlertProps> = ({
  message,
  retry,
  sx,
  ...rest
}) => {
  return (
    <Alert
      {...rest}
      severity="error"
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        whiteSpace: 'pre-wrap',
        [`& .${alertClasses.message}`]: {
          overflow: 'hidden',
        },
        ...sx,
      }}
    >
      <RetryErrorMessage {...{ message, retry }} />
    </Alert>
  );
};

export default ErrorAlert;
