import {
  CardContent,
  CardHeader,
  CardProps,
  Card as MuiCard,
  Skeleton,
} from '@mui/material';
import { FC, ReactNode } from 'react';

import { useLoadingContext, useSmallScreen } from '../hooks';
import ErrorSkeleton from './ErrorSkeleton';

export interface ICardProps extends Omit<CardProps, 'title'> {
  title?: ReactNode;
}

export const Card: FC<ICardProps> = ({ children, title, ...rest }) => {
  const { loading, errorMessage } = useLoadingContext();
  const smallScreen = useSmallScreen();

  return (
    <MuiCard {...rest}>
      {title && (
        <CardHeader
          title={(() => {
            const titleSkeletonWidth =
              typeof title === 'string' ? title.length * 10 : 0;

            if (errorMessage) {
              return (
                <ErrorSkeleton
                  sx={{
                    width: titleSkeletonWidth,
                  }}
                />
              );
            }

            if (loading) {
              return <Skeleton sx={{ width: titleSkeletonWidth }} />;
            }

            return title;
          })()}
          sx={{ px: smallScreen ? 2 : 3 }}
        />
      )}
      <CardContent sx={{ p: smallScreen ? 2 : 3 }}>{children}</CardContent>
    </MuiCard>
  );
};

export default Card;
