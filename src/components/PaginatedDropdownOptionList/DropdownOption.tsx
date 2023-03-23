import CheckIcon from '@mui/icons-material/Check';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import LockIcon from '@mui/icons-material/Lock';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem';
import clsx from 'clsx';
import { ReactNode, forwardRef } from 'react';

import { DropdownOption as DropdownOptionType } from '../../interfaces/Utils';

export interface DropdownOptionClasses {
  /** Styles applied to the root element. */
  root: string;
  iconContainer: string;
}

export type DropdownOptionClassKey = keyof DropdownOptionClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiDropdownOption: DropdownOptionProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiDropdownOption: keyof DropdownOptionClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiDropdownOption?: {
      defaultProps?: ComponentsProps['MuiDropdownOption'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiDropdownOption'];
      variants?: ComponentsVariants['MuiDropdownOption'];
    };
  }
}

export type DropdownOptionVariant = 'text' | 'checkbox' | 'check';

export interface DropdownOptionProps extends MenuItemProps {
  height?: number;
  selectable?: boolean;
  variant?: DropdownOptionVariant;
  icon?: ReactNode;
}

export const getDropdownOptionLabel = ({
  icon,
  label,
  iconWrapperClassName,
}: Pick<DropdownOptionType, 'label' | 'icon'> & {
  iconWrapperClassName?: string;
}) => {
  if (icon) {
    return (
      <Grid container sx={{ alignItems: 'center', gap: 1 }}>
        <Grid
          className={iconWrapperClassName}
          item
          sx={{ width: 24, display: 'flex' }}
        >
          {icon}
        </Grid>
        <Grid item>{label}</Grid>
      </Grid>
    );
  }
  return label;
};

export function getDropdownOptionUtilityClass(slot: string): string {
  return generateUtilityClass('MuiDropdownOption', slot);
}

export const dropdownOptionClasses: DropdownOptionClasses =
  generateUtilityClasses('MuiDropdownOption', ['root', 'iconContainer']);

const slots = {
  root: ['root'],
  iconContainer: ['iconContainer'],
};

export const DropdownOption = forwardRef<HTMLLIElement, DropdownOptionProps>(
  function DropdownOption(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiDropdownOption' });
    const {
      className,
      height,
      selectable = true,
      onClick,
      variant = 'text',
      selected,
      icon,
      children,
      sx,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getDropdownOptionUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { palette } = useTheme();

    const label = getDropdownOptionLabel({
      icon,
      label: children,
      iconWrapperClassName: clsx(classes.iconContainer),
    });

    return (
      <MenuItem
        ref={ref}
        {...rest}
        {...{ selected }}
        className={clsx(classes.root)}
        onClick={(event) => {
          if (selectable) {
            onClick && onClick(event);
          } else {
            event.stopPropagation();
          }
        }}
        sx={{
          minHeight: `${height}px !important`,
          fontSize: 14,
          lineHeight: `24px`,
          p: 0,
          display: 'flex',
          alignItems: 'center',
          '&.Mui-selected': {
            bgcolor: alpha(palette.primary.main, 0.08),
            ...(() => {
              if (selectable) {
                return {
                  '&:hover': {
                    bgcolor: alpha(palette.primary.main, 0.12),
                  },
                };
              } else {
                return {
                  cursor: 'inherit',
                  '&:hover': {
                    bgcolor: alpha(palette.primary.main, 0.08),
                  },
                };
              }
            })(),
          },
          ...(() => {
            if (selectable) {
              return {
                cursor: 'pointer',
              };
            }
            return { cursor: 'inherit' };
          })(),
          ...sx,
        }}
        disableRipple={!selectable}
        disabled={!selectable}
      >
        <Box
          sx={{
            py: 0.75,
            px: 2,
            width: `100%`,
          }}
        >
          {(() => {
            switch (variant) {
              case 'checkbox':
                return (
                  <Grid container sx={{ alignItems: 'center' }}>
                    <Grid item sx={{ display: 'flex', width: 30 }}>
                      {(() => {
                        if (selectable) {
                          if (selected) {
                            return <CheckBoxIcon color="inherit" />;
                          }
                          return (
                            <CheckBoxOutlineBlankIcon
                              color="inherit"
                              sx={{ opacity: 0.15 }}
                            />
                          );
                        }
                        return <LockIcon color="inherit" />;
                      })()}
                    </Grid>
                    <Grid item xs sx={{ minWidth: 0 }}>
                      {label}
                    </Grid>
                  </Grid>
                );
              case 'check':
                return (
                  <Grid container sx={{ alignItems: 'center' }}>
                    <Grid item sx={{ display: 'flex', width: 30 }}>
                      {(() => {
                        if (selectable) {
                          if (selected) {
                            return <CheckIcon color="inherit" />;
                          }
                          return (
                            <CheckBoxOutlineBlankIcon
                              color="inherit"
                              sx={{ opacity: 0.15 }}
                            />
                          );
                        }
                        return <LockIcon color="inherit" />;
                      })()}
                    </Grid>
                    <Grid item xs sx={{ minWidth: 0 }}>
                      {label}
                    </Grid>
                  </Grid>
                );
              case 'text':
                return label;
            }
          })()}
        </Box>
      </MenuItem>
    );
  }
);

export default DropdownOption;
