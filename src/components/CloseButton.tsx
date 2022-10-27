import CloseIcon from '@mui/icons-material/Close';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { alpha } from '@mui/system/colorManipulator';
import { ReactNode, forwardRef } from 'react';

export interface CloseButtonProps extends IconButtonProps {
  IconProps?: SvgIconProps;
  icon?: ReactNode;
}

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  function CloseButton({ icon, sx, IconProps, ...rest }, ref) {
    const { palette } = useTheme();
    const alphaBGColor = alpha(palette.text.primary, 0.3);
    return (
      <IconButton
        ref={ref}
        {...rest}
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
