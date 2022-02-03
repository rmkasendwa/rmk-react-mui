import { Skeleton, Typography, alpha, useTheme } from '@mui/material';
import { FC, ReactNode } from 'react';

import { useLoadingContext } from '../hooks';
import ErrorSkeleton from './ErrorSkeleton';
import FieldLabel from './FieldLabel';

export interface IFieldValueDisplayProps {
  label: string;
  value?: ReactNode;
}

export const FieldValueDisplay: FC<IFieldValueDisplayProps> = ({
  label,
  value,
}) => {
  value || (value = '-');
  const theme = useTheme();

  const { loading, errorMessage } = useLoadingContext();
  const labelSkeletonWidth = label.length * 7;
  const valueSkeletonWidth = `${20 + Math.round(Math.random() * 60)}%`;

  if (errorMessage) {
    return (
      <>
        <ErrorSkeleton
          sx={{
            width: labelSkeletonWidth,
          }}
        />
        <ErrorSkeleton
          sx={{
            width: valueSkeletonWidth,
          }}
        />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Skeleton sx={{ width: labelSkeletonWidth }} />
        <Skeleton sx={{ width: valueSkeletonWidth }} />
      </>
    );
  }

  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <Typography
        variant="body2"
        sx={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-line',
          color: alpha(theme.palette.text.primary, 0.5),
        }}
      >
        {value}
      </Typography>
    </>
  );
};

export default FieldValueDisplay;
