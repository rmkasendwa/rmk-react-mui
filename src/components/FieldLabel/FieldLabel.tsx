import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Typography, { TypographyProps } from '@mui/material/Typography';
import clsx from 'clsx';
import { FC } from 'react';

import {
  FieldLabelClasses,
  getFieldLabelUtilityClass,
} from './FieldLabelClasses';

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFieldLabel: IFieldLabelProps;
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

export interface IFieldLabelProps extends TypographyProps {
  required?: boolean;
}

export const FieldLabel: FC<IFieldLabelProps> = (inProps) => {
  const props = useThemeProps({ props: inProps, name: 'MuiFieldLabel' });
  const { required, children, sx, ...rest } = props;

  const classes = useUtilityClasses({
    ...props,
  });

  const { palette } = useTheme();
  return (
    <Typography
      classes={clsx(classes.root)}
      variant="body2"
      noWrap
      {...rest}
      sx={{
        fontWeight: 'bold',
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
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
};

export default FieldLabel;
