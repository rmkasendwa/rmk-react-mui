import { SvgIcon, SvgIconProps } from '@mui/material';
import { forwardRef } from 'react';

export interface ICaretBottomIconProps extends SvgIconProps {}

export const CaretBottomIcon = forwardRef<SVGSVGElement, ICaretBottomIconProps>(
  function CaretBottomIcon({ sx, ...rest }, ref) {
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
        <path d="M1001.6 268.8 515.2 824 28.8 268.8Z" />
      </SvgIcon>
    );
  }
);

export default CaretBottomIcon;
