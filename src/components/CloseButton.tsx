import CloseIcon from '@mui/icons-material/Close';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { alpha } from '@mui/system/colorManipulator';
import clsx from 'clsx';
import { ReactNode, forwardRef } from 'react';

export interface CloseButtonClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CloseButtonClassKey = keyof CloseButtonClasses;

export function getCloseButtonUtilityClass(slot: string): string {
  return generateUtilityClass('MuiCloseButton', slot);
}

export const fieldValueDisplayClasses: CloseButtonClasses =
  generateUtilityClasses('MuiCloseButton', ['root']);

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCloseButton: CloseButtonProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCloseButton: keyof CloseButtonClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCloseButton?: {
      defaultProps?: ComponentsProps['MuiCloseButton'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCloseButton'];
      variants?: ComponentsVariants['MuiCloseButton'];
    };
  }
}

const useUtilityClasses = (ownerState: any) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getCloseButtonUtilityClass, classes);
};

export interface CloseButtonProps extends IconButtonProps {
  IconProps?: SvgIconProps;
  icon?: ReactNode;
}

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  function CloseButton(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiCloseButton' });
    const { icon, sx, IconProps, ...rest } = props;

    const classes = useUtilityClasses({
      ...props,
    });

    const { palette } = useTheme();
    const alphaBGColor = alpha(palette.text.primary, 0.3);

    return (
      <IconButton
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          bgcolor: alphaBGColor,
          '&:hover': {
            bgcolor: alphaBGColor,
          },
          color: palette.background.paper,
          ...sx,
        }}
      >
        {icon ? icon : <CloseIcon {...IconProps} />}
      </IconButton>
    );
  }
);

export default CloseButton;
