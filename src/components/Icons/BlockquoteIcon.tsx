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

export interface BlockquoteIconClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type BlockquoteIconClassKey = keyof BlockquoteIconClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiBlockquoteIcon: BlockquoteIconProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiBlockquoteIcon: keyof BlockquoteIconClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiBlockquoteIcon?: {
      defaultProps?: ComponentsProps['MuiBlockquoteIcon'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiBlockquoteIcon'];
      variants?: ComponentsVariants['MuiBlockquoteIcon'];
    };
  }
}

export interface BlockquoteIconProps extends SvgIconProps {}

export function getBlockquoteIconUtilityClass(slot: string): string {
  return generateUtilityClass('MuiBlockquoteIcon', slot);
}

export const blockquoteIconClasses: BlockquoteIconClasses =
  generateUtilityClasses('MuiBlockquoteIcon', ['root']);

const slots = {
  root: ['root'],
};

export const BlockquoteIcon = forwardRef<SVGSVGElement, BlockquoteIconProps>(
  function BlockquoteIcon(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiBlockquoteIcon' });
    const { className, ...rest } = props;

    const classes = composeClasses(
      slots,
      getBlockquoteIconUtilityClass,
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
        viewBox="0 0 20 20"
      >
        <path d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0V2.75ZM6.75 3a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM6 10.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75Zm.75 5.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z"></path>
      </SvgIcon>
    );
  }
);

export default BlockquoteIcon;
