import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import useTheme from '@mui/material/styles/useTheme';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { alpha } from '@mui/system/colorManipulator';
import { FC, ReactNode } from 'react';

import { useLoadingContext } from '../hooks/Utils';
import ErrorSkeleton from './ErrorSkeleton';
import FieldLabel, { IFieldLabelProps } from './FieldLabel';

export interface IFieldValueDisplayProps {
  label: ReactNode;
  value?: ReactNode;
  LabelProps?: IFieldLabelProps;
  ValueProps?: TypographyProps;
}

export const FieldValueDisplay: FC<IFieldValueDisplayProps> = ({
  label,
  value,
  LabelProps = {},
  ValueProps = {},
}) => {
  value || (value = '-');
  const theme = useTheme();

  const { loading, errorMessage } = useLoadingContext();
  const labelSkeletonWidth = String(label).length * 7;
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
      {(() => {
        if (['string', 'number'].includes(typeof label)) {
          return <FieldLabel {...LabelProps}>{label}</FieldLabel>;
        }
        return label;
      })()}
      <Box sx={{ mt: 0.5, display: 'flex' }}>
        {(() => {
          if (['string', 'number'].includes(typeof value)) {
            const { sx, ...rest } = ValueProps;
            return (
              <Typography
                variant="body2"
                {...rest}
                sx={{
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line',
                  color: alpha(theme.palette.text.primary, 0.5),
                  ...sx,
                }}
              >
                {value}
              </Typography>
            );
          }
          return value;
        })()}
      </Box>
    </>
  );
};

export default FieldValueDisplay;
