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
import Typography, { TypographyProps } from '@mui/material/Typography';
import clsx from 'clsx';
import { FC } from 'react';

export interface FieldLabelClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FieldLabelClassKey = keyof FieldLabelClasses;

export function getFieldLabelUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFieldLabel', slot);
}

export const fieldValueDisplayClasses: FieldLabelClasses =
  generateUtilityClasses('MuiFieldLabel', ['root']);

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

const useUtilityClasses = (ownerState: any) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getFieldLabelUtilityClass, classes);
};

export interface FieldLabelProps extends TypographyProps {
  required?: boolean;
}

export const FieldLabel: FC<FieldLabelProps> = (inProps) => {
  const props = useThemeProps({ props: inProps, name: 'MuiFieldLabel' });
  const { required, children, sx, ...rest } = props;

  const classes = useUtilityClasses({
    ...props,
  });

  const { palette, components } = useTheme();
  return (
    <Typography
      className={clsx(classes.root)}
      component={'div' as any}
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
    </Typography>
  );
};

export default FieldLabel;
