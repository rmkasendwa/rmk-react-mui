import Skeleton, { SkeletonProps } from '@mui/material/Skeleton';
import useTheme from '@mui/material/styles/useTheme';
import { alpha } from '@mui/system/colorManipulator';
import { FC } from 'react';

export interface ErrorSkeletonProps extends SkeletonProps {}

export const ErrorSkeleton: FC<ErrorSkeletonProps> = ({ sx, ...rest }) => {
  const theme = useTheme();
  return (
    <Skeleton
      sx={{
        bgcolor: alpha(theme.palette.text.disabled, 0.05),
        ...sx,
      }}
      {...rest}
      animation={false}
    />
  );
};

export default ErrorSkeleton;
