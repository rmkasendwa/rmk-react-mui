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

export interface UndoIconClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type UndoIconClassKey = keyof UndoIconClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiUndoIcon: UndoIconProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiUndoIcon: keyof UndoIconClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiUndoIcon?: {
      defaultProps?: ComponentsProps['MuiUndoIcon'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiUndoIcon'];
      variants?: ComponentsVariants['MuiUndoIcon'];
    };
  }
}

export interface UndoIconProps extends SvgIconProps {}

export function getUndoIconUtilityClass(slot: string): string {
  return generateUtilityClass('MuiUndoIcon', slot);
}

export const undoIconClasses: UndoIconClasses = generateUtilityClasses(
  'MuiUndoIcon',
  ['root']
);

const slots = {
  root: ['root'],
};

export const UndoIcon = forwardRef<SVGSVGElement, UndoIconProps>(
  function UndoIcon(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiUndoIcon' });
    const { className, ...rest } = props;

    const classes = composeClasses(
      slots,
      getUndoIconUtilityClass,
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
        <path d="M17.856 24c2.665-4.83 3.115-12.195-7.356-11.95V18l-9-9 9-9v5.82C23.038 5.495 24.435 16.89 17.856 24z" />
      </SvgIcon>
    );
  }
);

export default UndoIcon;
