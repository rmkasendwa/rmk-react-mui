import Alert, { AlertProps, alertClasses } from '@mui/material/Alert';
import { FC } from 'react';

import RetryErrorMessage, {
  IRetryErrorMessageProps,
} from './RetryErrorMessage';

export interface IErrorAlertProps extends IRetryErrorMessageProps, AlertProps {}

export const ErrorAlert: FC<IErrorAlertProps> = ({
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
