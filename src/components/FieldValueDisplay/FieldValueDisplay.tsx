import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import useTheme from '@mui/material/styles/useTheme';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { alpha } from '@mui/system/colorManipulator';
import clsx from 'clsx';
import { FC, ReactNode } from 'react';

import { useLoadingContext } from '../../contexts/LoadingContext';
import ErrorSkeleton from '../ErrorSkeleton';
import FieldLabel, { IFieldLabelProps } from '../FieldLabel/FieldLabel';
import {
  FieldValueDisplayClasses,
  getFieldValueDisplayUtilityClass,
} from './fieldValueDisplayClasses';

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFieldValueDisplay: IFieldValueDisplayProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFieldValueDisplay: keyof FieldValueDisplayClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFieldValueDisplay?: {
      defaultProps?: ComponentsProps['MuiFieldValueDisplay'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFieldValueDisplay'];
      variants?: ComponentsVariants['MuiFieldValueDisplay'];
    };
  }
}

const useUtilityClasses = (ownerState: any) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getFieldValueDisplayUtilityClass, classes);
};

export interface IFieldValueDisplayProps
  extends Pick<IFieldLabelProps, 'required'> {
  label: ReactNode;
  value?: ReactNode;
  LabelProps?: IFieldLabelProps;
  ValueProps?: TypographyProps;
}

export const FieldValueDisplay: FC<IFieldValueDisplayProps> = (inProps) => {
  const props = useThemeProps({ props: inProps, name: 'MuiFieldValueDisplay' });
  const {
    label,
    value = '-',
    LabelProps = {},
    ValueProps = {},
    required,
  } = props;

  const classes = useUtilityClasses({
    ...props,
  });

  const { sx: labelPropsSx, ...labelPropsRest } = LabelProps;

  const { palette } = useTheme();
  const { loading, errorMessage } = useLoadingContext();
  const labelSkeletonWidth = String(label).length * 7;
  const valueSkeletonWidth = `${20 + Math.round(Math.random() * 60)}%`;

  if (errorMessage) {
    return (
      <Box className={clsx(classes.root)}>
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
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className={clsx(classes.root)}>
        <Skeleton sx={{ width: labelSkeletonWidth }} />
        <Skeleton sx={{ width: valueSkeletonWidth }} />
      </Box>
    );
  }

  return (
    <Box className={clsx(classes.root)}>
      <FieldLabel
        {...{ required }}
        {...labelPropsRest}
        sx={{
          ...labelPropsSx,
        }}
      >
        {label}
      </FieldLabel>
      <Box
        sx={{
          mt: 0.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
        }}
      >
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
                  color: alpha(palette.text.primary, 0.5),
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
    </Box>
  );
};

export default FieldValueDisplay;
