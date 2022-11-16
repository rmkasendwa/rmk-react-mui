import CheckIcon from '@mui/icons-material/Check';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Grid, alpha, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem';
import { forwardRef } from 'react';

export const DEFAULT_DROPDOWN_OPTION_HEIGHT = 36;

export type DropdownOptionVariant = 'text' | 'checkbox' | 'check';

export interface DropdownOptionProps extends MenuItemProps {
  height?: number;
  selectable?: boolean;
  variant?: DropdownOptionVariant;
}

export const DropdownOption = forwardRef<HTMLLIElement, DropdownOptionProps>(
  function DropdownOption(
    {
      height = DEFAULT_DROPDOWN_OPTION_HEIGHT,
      selectable = true,
      onClick,
      variant = 'text',
      selected,
      children,
      ...rest
    },
    ref
  ) {
    const { palette } = useTheme();
    return (
      <MenuItem
        ref={ref}
        {...rest}
        {...{ selected }}
        onClick={selectable ? onClick : undefined}
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
        }}
        disableRipple={!selectable}
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
                      {selected ? (
                        <CheckBoxIcon color="inherit" />
                      ) : (
                        <CheckBoxOutlineBlankIcon
                          color="inherit"
                          sx={{ opacity: 0.15 }}
                        />
                      )}
                    </Grid>
                    <Grid item xs sx={{ minWidth: 0 }}>
                      {children}
                    </Grid>
                  </Grid>
                );
              case 'check':
                return (
                  <Grid container sx={{ alignItems: 'center' }}>
                    <Grid item sx={{ display: 'flex', width: 30 }}>
                      {selected ? (
                        <CheckIcon color="inherit" />
                      ) : (
                        <CheckBoxOutlineBlankIcon
                          color="inherit"
                          sx={{ opacity: 0.05 }}
                        />
                      )}
                    </Grid>
                    <Grid item xs sx={{ minWidth: 0 }}>
                      {children}
                    </Grid>
                  </Grid>
                );
              case 'text':
                return children;
            }
          })()}
        </Box>
      </MenuItem>
    );
  }
);

export default DropdownOption;
