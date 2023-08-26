import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import clsx from 'clsx';
import { forwardRef } from 'react';

export interface RedoIconClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type RedoIconClassKey = keyof RedoIconClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiRedoIcon: RedoIconProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiRedoIcon: keyof RedoIconClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiRedoIcon?: {
      defaultProps?: ComponentsProps['MuiRedoIcon'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiRedoIcon'];
      variants?: ComponentsVariants['MuiRedoIcon'];
    };
  }
}
//#endregion

export const getRedoIconUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiRedoIcon', slot);
};

const slots: Record<RedoIconClassKey, [RedoIconClassKey]> = {
  root: ['root'],
};

export const redoIconClasses: RedoIconClasses = generateUtilityClasses(
  'MuiRedoIcon',
  Object.keys(slots) as RedoIconClassKey[]
);

export interface RedoIconProps extends SvgIconProps {}

export const RedoIcon = forwardRef<SVGSVGElement, RedoIconProps>(
  function RedoIcon(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiRedoIcon' });
    const { className, ...rest } = props;

    const classes = composeClasses(
      slots,
      getRedoIconUtilityClass,
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
        viewBox="0 0 24 24"
      >
        <path d="M13.5 5.82V0l9 9-9 9v-5.95C3.03 11.806 3.478 19.17 6.144 24-.436 16.89.962 5.494 13.5 5.82z" />
      </SvgIcon>
    );
  }
);

export default RedoIcon;
