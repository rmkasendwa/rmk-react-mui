import { Skeleton } from '@mui/material';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { FC } from 'react';

import { useLoadingContext } from '../hooks/Utils';
import ErrorSkeleton from './ErrorSkeleton';

export interface ILoadingTypographyProps extends TypographyProps {}

export const LoadingTypography: FC<ILoadingTypographyProps> = ({
  children,
  ...rest
}) => {
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
  return <Typography {...rest}>{children}</Typography>;
};

export default LoadingTypography;
