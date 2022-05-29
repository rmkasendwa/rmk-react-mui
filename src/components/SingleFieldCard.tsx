import { Skeleton, Typography, useTheme } from '@mui/material';
import { FC } from 'react';

import { useLoadingContext } from '../hooks/Utils';
import Card from './Card';
import ErrorSkeleton from './ErrorSkeleton';
import FieldLabel from './FieldLabel';

export interface ISingleFieldCardProps {
  label: string;
  value: string | number;
}

export const SingleFieldCard: FC<ISingleFieldCardProps> = ({
  label,
  value,
}) => {
  const theme = useTheme();
  const { loading, errorMessage } = useLoadingContext();

  return (
    <Card
      sx={{
        borderTop: `6px solid ${theme.palette.primary.main}`,
      }}
    >
      {(() => {
        const labelSkeletonWidth = label.length * 14;
        const valueSkeletonWidth = label.length * 20;

        if (errorMessage) {
          return (
            <>
              <ErrorSkeleton
                sx={{
                  width: labelSkeletonWidth,
                  mx: 'auto',
                }}
              />
              <ErrorSkeleton
                sx={{
                  width: valueSkeletonWidth,
                  height: 36,
                  mx: 'auto',
                }}
              />
            </>
          );
        }

        if (loading) {
          return (
            <>
              <Skeleton sx={{ width: labelSkeletonWidth, mx: 'auto' }} />
              <Skeleton
                sx={{ width: valueSkeletonWidth, height: 36, mx: 'auto' }}
              />
            </>
          );
        }

        return (
          <>
            <FieldLabel align="center">{label}</FieldLabel>
            <Typography
              variant="body1"
              align="center"
              sx={{
                fontSize: 24,
                fontWeight: 'bold',
                [theme.breakpoints.down('lg')]: {
                  fontSize: 18,
                },
              }}
            >
              {value || '-'}
            </Typography>
          </>
        );
      })()}
    </Card>
  );
};

export default SingleFieldCard;
