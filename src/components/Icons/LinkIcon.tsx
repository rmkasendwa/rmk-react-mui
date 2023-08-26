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

export interface LinkIconClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type LinkIconClassKey = keyof LinkIconClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiLinkIcon: LinkIconProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiLinkIcon: keyof LinkIconClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiLinkIcon?: {
      defaultProps?: ComponentsProps['MuiLinkIcon'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiLinkIcon'];
      variants?: ComponentsVariants['MuiLinkIcon'];
    };
  }
}
//#endregion

export const getLinkIconUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiLinkIcon', slot);
};

const slots: Record<LinkIconClassKey, [LinkIconClassKey]> = {
  root: ['root'],
};

export const linkIconClasses: LinkIconClasses = generateUtilityClasses(
  'MuiLinkIcon',
  Object.keys(slots) as LinkIconClassKey[]
);

export interface LinkIconProps extends SvgIconProps {}

export const LinkIcon = forwardRef<SVGSVGElement, LinkIconProps>(
  function LinkIcon(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiLinkIcon' });
    const { className, ...rest } = props;

    const classes = composeClasses(
      slots,
      getLinkIconUtilityClass,
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
        <path d="M12.306 3.755a2.75 2.75 0 0 1 3.889 0l.05.05a2.75 2.75 0 0 1 0 3.89l-3.18 3.18a2.75 2.75 0 0 1-3.98-.096l-.03-.034a.75.75 0 1 0-1.11 1.01l.03.033a4.25 4.25 0 0 0 6.15.147l3.18-3.18a4.25 4.25 0 0 0 0-6.01l-.05-.05a4.25 4.25 0 0 0-6.01 0L9.47 4.47a.75.75 0 1 0 1.06 1.06l1.776-1.775Zm-4.611 12.49a2.75 2.75 0 0 1-3.89 0l-.05-.05a2.75 2.75 0 0 1 0-3.89l3.18-3.18a2.75 2.75 0 0 1 3.98.096l.03.033a.75.75 0 1 0 1.11-1.009l-.03-.034a4.25 4.25 0 0 0-6.15-.146l-3.18 3.18a4.25 4.25 0 0 0 0 6.01l.05.05a4.25 4.25 0 0 0 6.01 0l1.775-1.775a.75.75 0 0 0-1.06-1.06l-1.775 1.775Z"></path>
      </SvgIcon>
    );
  }
);

export default LinkIcon;
