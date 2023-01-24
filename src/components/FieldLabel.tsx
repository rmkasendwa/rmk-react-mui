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
import clsx from 'clsx';
import { forwardRef } from 'react';

import LoadingTypography, { LoadingTypographyProps } from './LoadingTypography';

export interface FieldLabelClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FieldLabelClassKey = keyof FieldLabelClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFieldLabel: FieldLabelProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFieldLabel: keyof FieldLabelClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFieldLabel?: {
      defaultProps?: ComponentsProps['MuiFieldLabel'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFieldLabel'];
      variants?: ComponentsVariants['MuiFieldLabel'];
    };
  }
}

export interface FieldLabelProps extends LoadingTypographyProps {
  required?: boolean;
}

export function getFieldLabelUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFieldLabel', slot);
}

export const fieldLabelClasses: FieldLabelClasses = generateUtilityClasses(
  'MuiFieldLabel',
  ['root']
);

const slots = {
  root: ['root'],
};

export const FieldLabel = forwardRef<HTMLElement, FieldLabelProps>(
  function FieldLabel(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiFieldLabel' });
    const { required, children, className, sx, ...rest } = props;

    const classes = composeClasses(
      slots,
      getFieldLabelUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { palette, components } = useTheme();

    return (
      <LoadingTypography
        ref={ref as any}
        className={clsx(classes.root, className)}
        {...{ component: 'div' }}
        variant="body2"
        noWrap
        {...rest}
        sx={{
          fontWeight: 500,
          ...(() => {
            if (required) {
              return {
                '&:after': {
                  content: '"*"',
                  ml: 0.2,
                  color: palette.error.main,
                },
              };
            }
          })(),
          ...((components?.MuiFieldLabel?.styleOverrides?.root as any) || {}),
          ...sx,
        }}
      >
        {children}
      </LoadingTypography>
    );
  }
);

export default FieldLabel;
