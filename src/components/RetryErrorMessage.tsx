import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  ComponentsProps,
  ComponentsVariants,
  Stack,
  Typography,
  alpha,
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

  const { shortMessage, longMessage } = ((): {
    shortMessage: string;
    longMessage?: string;
  } => {
    if (message.length > 100 || message.match(/\n/)) {
      return {
        shortMessage: 'An error occurred.',
        longMessage: message,
      };
    }
    return {
      shortMessage: message,
    };
  })();

  return (
    <Stack
      sx={{
        maxWidth: 400,
      }}
    >
      <Typography component="div" variant="inherit">
        {shortMessage}
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
      </Typography>
      {longMessage && (
        <Box
          sx={({ palette }) => ({
            maxHeight: 200,
            overflow: 'auto',
            bgcolor: alpha(palette.error.main, 0.06),
            py: 0.5,
            px: 1,
            borderRadius: 1,
            boxShadow: `rgba(0, 0, 0, 0.06) 0px 2px 4px 0px inset`,
          })}
        >
          <Typography component="div" variant="caption">
            {longMessage}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

export default RetryErrorMessage;
