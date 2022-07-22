import Box from '@mui/material/Box';
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem';
import { forwardRef } from 'react';

export const DEFAULT_DROPDOWN_OPTION_HEIGHT = 36;

export interface IDropdownOptionProps extends MenuItemProps {
  height?: number;
  selectable?: boolean;
}

export const DropdownOption = forwardRef<HTMLLIElement, IDropdownOptionProps>(
  function DropdownOption(
    {
      height = DEFAULT_DROPDOWN_OPTION_HEIGHT,
      selectable = true,
      onClick,
      children,
      ...rest
    },
    ref
  ) {
    return (
      <MenuItem
        ref={ref}
        {...rest}
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
          {children}
        </Box>
      </MenuItem>
    );
  }
);

export default DropdownOption;
