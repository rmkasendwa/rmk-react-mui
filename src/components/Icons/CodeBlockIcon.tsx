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

export interface CodeBlockIconClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CodeBlockIconClassKey = keyof CodeBlockIconClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCodeBlockIcon: CodeBlockIconProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCodeBlockIcon: keyof CodeBlockIconClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCodeBlockIcon?: {
      defaultProps?: ComponentsProps['MuiCodeBlockIcon'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCodeBlockIcon'];
      variants?: ComponentsVariants['MuiCodeBlockIcon'];
    };
  }
}

export interface CodeBlockIconProps extends SvgIconProps {}

export function getCodeBlockIconUtilityClass(slot: string): string {
  return generateUtilityClass('MuiCodeBlockIcon', slot);
}

export const codeBlockIconClasses: CodeBlockIconClasses =
  generateUtilityClasses('MuiCodeBlockIcon', ['root']);

const slots = {
  root: ['root'],
};

export const CodeBlockIcon = forwardRef<SVGSVGElement, CodeBlockIconProps>(
  function CodeBlockIcon(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiCodeBlockIcon' });
    const { className, ...rest } = props;

    const classes = composeClasses(
      slots,
      getCodeBlockIconUtilityClass,
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
        <path d="M9.212 2.737a.75.75 0 1 0-1.424-.474l-2.5 7.5a.75.75 0 0 0 1.424.474l2.5-7.5Zm6.038.265a.75.75 0 0 0 0 1.5h2a.25.25 0 0 1 .25.25v11.5a.25.25 0 0 1-.25.25h-13a.25.25 0 0 1-.25-.25v-3.5a.75.75 0 0 0-1.5 0v3.5c0 .966.784 1.75 1.75 1.75h13a1.75 1.75 0 0 0 1.75-1.75v-11.5a1.75 1.75 0 0 0-1.75-1.75h-2Zm-3.69.5a.75.75 0 1 0-1.12.996l1.556 1.753-1.556 1.75a.75.75 0 1 0 1.12.997l2-2.248a.75.75 0 0 0 0-.996l-2-2.252ZM3.999 9.06a.75.75 0 0 1-1.058-.062l-2-2.248a.75.75 0 0 1 0-.996l2-2.252a.75.75 0 1 1 1.12.996L2.504 6.251l1.557 1.75a.75.75 0 0 1-.062 1.06Z"></path>
      </SvgIcon>
    );
  }
);

export default CodeBlockIcon;
