import { Skeleton, SkeletonProps, alpha, useTheme } from '@mui/material';
import { FC } from 'react';

export interface IErrorSkeletonProps extends SkeletonProps {}

export const ErrorSkeleton: FC<IErrorSkeletonProps> = ({ sx, ...rest }) => {
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
