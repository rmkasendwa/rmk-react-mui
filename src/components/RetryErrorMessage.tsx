import RefreshIcon from '@mui/icons-material/Refresh';
import {
  ComponentsProps,
  ComponentsVariants,
  useThemeProps,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { FC } from 'react';

import Tooltip from './Tooltip';

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiRetryErrorMessage: RetryErrorMessageProps;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components {
    MuiRetryErrorMessage?: {
      defaultProps?: ComponentsProps['MuiRetryErrorMessage'];
      variants?: ComponentsVariants['MuiRetryErrorMessage'];
    };
  }
}
//#endregion

export interface RetryErrorMessageProps {
  message: string;
  retry?: () => void;
}

export const RetryErrorMessage: FC<RetryErrorMessageProps> = (inProps) => {
  const props = useThemeProps({ props: inProps, name: 'MuiRetryErrorMessage' });
  const { message, retry } = props;

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
