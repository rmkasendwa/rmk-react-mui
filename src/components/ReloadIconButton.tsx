import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  TooltipProps,
} from '@mui/material';
import { FC } from 'react';

export interface IReloadIconButtonProps
  extends Omit<TooltipProps, 'title' | 'children'> {
  loading?: boolean;
  load?: () => void;
}

export const ReloadIconButton: FC<IReloadIconButtonProps> = ({
  loading = false,
  load,
  ...rest
}) => {
  return (
    <Tooltip title={loading ? 'Loading...' : 'Reload'} {...rest}>
      <Box component="span">
        {loading ? (
          <IconButton disabled>
            <CircularProgress size={24} color="inherit" />
          </IconButton>
        ) : (
          <IconButton onClick={() => load && load()}>
            <RefreshIcon color="inherit" sx={{ display: 'block' }} />
          </IconButton>
        )}
      </Box>
    </Tooltip>
  );
};

export default ReloadIconButton;
