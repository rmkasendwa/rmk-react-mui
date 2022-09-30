import { SvgIcon, SvgIconProps } from '@mui/material';
import { forwardRef } from 'react';

export interface ICaretTopIconProps extends SvgIconProps {}

export const CaretTopIcon = forwardRef<SVGSVGElement, ICaretTopIconProps>(
  function CaretTopIcon({ sx, ...rest }, ref) {
    return (
      <SvgIcon
        ref={ref}
        {...rest}
        viewBox="0 0 1024 1024"
        sx={{
          ...sx,
          height: 'auto',
        }}
      >
        <path d="M512 256l-512 512 1024 0-512-512z" />
      </SvgIcon>
    );
  }
);

export default CaretTopIcon;
