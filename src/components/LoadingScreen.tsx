import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { CSSProperties, FC } from 'react';

interface LoadingScreenProps {
  absolute?: boolean;
}

export const LoadingScreen: FC<LoadingScreenProps> = ({ absolute }) => {
  const style: CSSProperties = {};
  if (absolute) {
    Object.assign(style, {
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
    });
  } else {
    Object.assign(style, {
      height: 200,
    });
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
    >
      <CircularProgress size={60} sx={{ mt: 1 }} />
    </Box>
  );
};

export default LoadingScreen;
