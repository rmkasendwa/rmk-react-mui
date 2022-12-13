import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box, { BoxProps } from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { FC } from 'react';

export interface ReloadIconButtonProps
  extends Omit<BoxProps, 'title' | 'children'> {
  loading?: boolean;
  errorMessage?: string;
  load?: () => void;
}

export const ReloadIconButton: FC<ReloadIconButtonProps> = ({
  loading = false,
  load,
  errorMessage,
  ...rest
}) => {
  return (
    <Box {...rest}>
      {(() => {
        if (loading) {
          return (
            <Tooltip title="Loading...">
              <Box component="span">
                <IconButton
                  disabled
                  sx={{
                    color: 'inherit !important',
                  }}
                >
                  <CircularProgress size={24} color="inherit" />
                </IconButton>
              </Box>
            </Tooltip>
          );
        }
        const refreshButton = (
          <Tooltip title="Reload">
            <Box component="span">
              <IconButton
                onClick={() => load && load()}
                sx={{
                  color: 'inherit !important',
                }}
              >
                <RefreshIcon color="inherit" sx={{ display: 'block' }} />
              </IconButton>
            </Box>
          </Tooltip>
        );
        if (errorMessage) {
          return (
            <Grid container alignItems="center">
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
};

export default ReloadIconButton;
