import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  BoxProps,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { FC } from 'react';

export interface IReloadIconButtonProps
  extends Omit<BoxProps, 'title' | 'children'> {
  loading?: boolean;
  errorMessage?: string;
  load?: () => void;
}

export const ReloadIconButton: FC<IReloadIconButtonProps> = ({
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
            <Tooltip title="Loading..." arrow>
              <Box component="span">
                <IconButton disabled>
                  <CircularProgress size={24} color="inherit" />
                </IconButton>
              </Box>
            </Tooltip>
          );
        }
        const refreshButton = (
          <Tooltip title="Reload" arrow>
            <Box component="span">
              <IconButton onClick={() => load && load()}>
                <RefreshIcon color="inherit" sx={{ display: 'block' }} />
              </IconButton>
            </Box>
          </Tooltip>
        );
        if (errorMessage) {
          return (
            <Grid container alignItems="center" columnSpacing={1}>
              <Grid item display="flex">
                <Tooltip title={errorMessage} arrow>
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
