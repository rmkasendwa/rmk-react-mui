import { Skeleton } from '@mui/material';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { forwardRef } from 'react';

import { useLoadingContext } from '../contexts/LoadingContext';
import ErrorSkeleton from './ErrorSkeleton';

export interface LoadingTypographyProps extends TypographyProps {}

export const LoadingTypography = forwardRef<
  HTMLElement,
  LoadingTypographyProps
>(function LoadingTypography({ children, ...rest }, ref) {
  const { loading, errorMessage } = useLoadingContext();
  const labelSkeletonWidth = String(children).length * 7;

  if (errorMessage) {
    return (
      <ErrorSkeleton
        sx={{
          width: labelSkeletonWidth,
        }}
      />
    );
  }

  if (loading) {
    return <Skeleton sx={{ width: labelSkeletonWidth }} />;
  }
  return (
    <Typography ref={ref} {...rest}>
      {children}
    </Typography>
  );
});

export default LoadingTypography;
