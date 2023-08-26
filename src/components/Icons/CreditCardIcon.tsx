import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  SvgIcon,
  SvgIconProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef } from 'react';

export interface CreditCardIconClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CreditCardIconClassKey = keyof CreditCardIconClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCreditCardIcon: CreditCardIconProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCreditCardIcon: keyof CreditCardIconClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCreditCardIcon?: {
      defaultProps?: ComponentsProps['MuiCreditCardIcon'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCreditCardIcon'];
      variants?: ComponentsVariants['MuiCreditCardIcon'];
    };
  }
}
//#endregion

export const getCreditCardIconUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiCreditCardIcon', slot);
};

const slots: Record<CreditCardIconClassKey, [CreditCardIconClassKey]> = {
  root: ['root'],
};

export const creditCardIconClasses: CreditCardIconClasses =
  generateUtilityClasses(
    'MuiCreditCardIcon',
    Object.keys(slots) as CreditCardIconClassKey[]
  );

export interface CreditCardIconProps extends SvgIconProps {}

export const CreditCardIcon = forwardRef<SVGSVGElement, CreditCardIconProps>(
  function CreditCardIcon(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiCreditCardIcon' });
    const { className, ...rest } = props;

    const classes = composeClasses(
      slots,
      getCreditCardIconUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    return (
      <SvgIcon
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        viewBox="0 0 27 18"
      >
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
