import { Alert } from '@mui/material';
import { FC } from 'react';

import RetryErrorMessage, {
  IRetryErrorMessageProps,
} from './RetryErrorMessage';

export interface IErrorAlertProps extends IRetryErrorMessageProps {}

export const ErrorAlert: FC<IErrorAlertProps> = ({ message, retry }) => {
  return (
    <Alert severity="error" sx={{ width: '100%', boxSizing: 'border-box' }}>
      <RetryErrorMessage {...{ message, retry }} />
    </Alert>
  );
};

export default ErrorAlert;
