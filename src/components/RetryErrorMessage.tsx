import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import { FC } from 'react';

import Tooltip from './Tooltip';

export interface RetryErrorMessageProps {
  message: string;
  retry?: () => void;
}

export const RetryErrorMessage: FC<RetryErrorMessageProps> = ({
  message,
  retry,
}) => {
  return (
    <>
      {message}
      {retry && (
        <>
          {' '}
          <Tooltip title="Try again">
            <IconButton
              onClick={() => retry()}
              size="small"
              sx={{ width: 12, height: 12 }}
            >
              <RefreshIcon
                color="inherit"
                sx={{ display: 'block', width: 18, height: 18 }}
              />
            </IconButton>
          </Tooltip>
        </>
      )}
    </>
  );
};

export default RetryErrorMessage;
