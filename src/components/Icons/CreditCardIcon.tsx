import { SvgIcon, SvgIconProps } from '@mui/material';
import { forwardRef } from 'react';

export interface CreditCardIconProps extends SvgIconProps {}

export const CreditCardIcon = forwardRef<SVGSVGElement, CreditCardIconProps>(
  function CreditCardIcon({ ...rest }, ref) {
    return (
      <SvgIcon ref={ref} {...rest} viewBox="0 0 27 18">
        <path
          fill="#E6E9EB"
          d="M0 3a3 3 0 0 1 3-3h21a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3z"
        />
        <path fill="#B9C4C9" d="M4 12h19v2H4z" />
        <rect width="4" height="4" x="4" y="4" fill="#fff" rx="1" />
      </SvgIcon>
    );
  }
);

export default CreditCardIcon;
