import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem';
import { forwardRef } from 'react';

export const DEFAULT_DROPDOWN_OPTION_HEIGHT = 36;

export type TDropdownOptionVariant = 'text' | 'checkbox';

export interface IDropdownOptionProps extends MenuItemProps {
  height?: number;
  selectable?: boolean;
  variant?: TDropdownOptionVariant;
}

export const DropdownOption = forwardRef<HTMLLIElement, IDropdownOptionProps>(
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
    return (
      <MenuItem
        ref={ref}
        {...rest}
        {...{ selected }}
        onClick={selectable ? onClick : undefined}
        sx={{
          minHeight: height,
          fontSize: 14,
          lineHeight: `24px`,
          p: 0,
        }}
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
                        <CheckBoxOutlineBlankIcon color="inherit" />
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
