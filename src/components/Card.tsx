import MuiCard, { CardProps } from '@mui/material/Card';
import CardContent, { CardContentProps } from '@mui/material/CardContent';
import CardHeader, { CardHeaderProps } from '@mui/material/CardHeader';
import Skeleton from '@mui/material/Skeleton';
import { FC, ReactNode } from 'react';

import { useLoadingContext, useSmallScreen } from '../hooks/Utils';
import ErrorSkeleton from './ErrorSkeleton';

export interface ICardProps extends Omit<CardProps, 'title'> {
  title?: ReactNode;
  CardHeaderProps?: CardHeaderProps;
  CardContentProps?: CardContentProps;
}

export const Card: FC<ICardProps> = ({
  children,
  title,
  CardHeaderProps = {},
  CardContentProps = {},
  ...rest
}) => {
  const { loading, errorMessage } = useLoadingContext();
  const smallScreen = useSmallScreen();

  const { sx: sxCardHeaderProps, ...restCardHeaderProps } = CardHeaderProps;
  const { sx: sxCardContentProps, ...restCardContentProps } = CardContentProps;

  return (
    <MuiCard {...rest}>
      {title && (
        <CardHeader
          {...restCardHeaderProps}
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
          sx={{ px: smallScreen ? 2 : 3, ...sxCardHeaderProps }}
        />
      )}
      <CardContent
        {...restCardContentProps}
        sx={{ p: smallScreen ? 2 : 3, ...sxCardContentProps }}
      >
        {children}
      </CardContent>
    </MuiCard>
  );
};

export default Card;
