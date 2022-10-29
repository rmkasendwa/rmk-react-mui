import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { TypographyProps } from '@mui/material/Typography';
import clsx from 'clsx';
import { FC, ReactNode } from 'react';

import { useLoadingContext } from '../contexts/LoadingContext';
import ErrorSkeleton from './ErrorSkeleton';
import FieldLabel, { FieldLabelProps } from './FieldLabel';
import FieldValue from './FieldValue';

export interface FieldValueDisplayClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FieldValueDisplayClassKey = keyof FieldValueDisplayClasses;

export function getFieldValueDisplayUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFieldValueDisplay', slot);
}

export const fieldValueDisplayClasses: FieldValueDisplayClasses =
  generateUtilityClasses('MuiFieldValueDisplay', ['root']);

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFieldValueDisplay: FieldValueDisplayProps;
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

export interface FieldValueDisplayProps
  extends Partial<BoxProps>,
    Pick<FieldLabelProps, 'required'> {
  label: ReactNode;
  value?: ReactNode;
  LabelProps?: FieldLabelProps;
  ValueProps?: TypographyProps;
}

export const FieldValueDisplay: FC<FieldValueDisplayProps> = (inProps) => {
  const props = useThemeProps({ props: inProps, name: 'MuiFieldValueDisplay' });
  const {
    label,
    value = '-',
    LabelProps = {},
    ValueProps = {},
    required,
    sx,
    ...rest
  } = props;

  const classes = useUtilityClasses({
    ...props,
  });

  const { ...labelPropsRest } = LabelProps;
  const { sx: valuePropsSx, ...valuePropsRest } = ValueProps;

  const { components } = useTheme();
  const { loading, errorMessage } = useLoadingContext();
  const labelSkeletonWidth = String(label).length * 7;
  const valueSkeletonWidth = `${20 + Math.round(Math.random() * 60)}%`;

  if (errorMessage) {
    return (
      <Box
        className={clsx(classes.root)}
        {...rest}
        sx={{
          ...((components?.MuiFieldValueDisplay?.styleOverrides?.root as any) ||
            {}),
          ...sx,
        }}
      >
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
      <Box
        className={clsx(classes.root)}
        {...rest}
        sx={{
          ...((components?.MuiFieldValueDisplay?.styleOverrides?.root as any) ||
            {}),
          ...sx,
        }}
      >
        <Skeleton sx={{ width: labelSkeletonWidth }} />
        <Skeleton sx={{ width: valueSkeletonWidth }} />
      </Box>
    );
  }

  return (
    <Box
      className={clsx(classes.root)}
      {...rest}
      sx={{
        ...(components?.MuiFieldValueDisplay?.styleOverrides?.root as any),
        ...sx,
      }}
    >
      <FieldLabel {...{ required }} {...labelPropsRest}>
        {label}
      </FieldLabel>
      <FieldValue {...valuePropsRest} sx={{ mt: 0.5, ...valuePropsSx }}>
        {value}
      </FieldValue>
    </Box>
  );
};

export default FieldValueDisplay;
