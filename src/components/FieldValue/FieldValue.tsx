import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  alpha,
  unstable_composeClasses as composeClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Typography, { TypographyProps } from '@mui/material/Typography';
import clsx from 'clsx';
import { FC } from 'react';

import {
  FieldValueClasses,
  getFieldValueUtilityClass,
} from './FieldValueClasses';

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFieldValue: IFieldValueProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFieldValue: keyof FieldValueClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFieldValue?: {
      defaultProps?: ComponentsProps['MuiFieldValue'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFieldValue'];
      variants?: ComponentsVariants['MuiFieldValue'];
    };
  }
}

const useUtilityClasses = (ownerState: any) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getFieldValueUtilityClass, classes);
};

export interface IFieldValueProps extends TypographyProps {}

export const FieldValue: FC<IFieldValueProps> = (inProps) => {
  const props = useThemeProps({ props: inProps, name: 'MuiFieldValue' });
  const { children, sx, ...rest } = props;

  const classes = useUtilityClasses({
    ...props,
  });

  const { palette } = useTheme();
  return (
    <Typography
      className={clsx(classes.root)}
      variant="body2"
      {...rest}
      sx={{
        wordBreak: 'break-word',
        whiteSpace: 'pre-line',
        color: alpha(palette.text.primary, 0.5),
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
};

export default FieldValue;
