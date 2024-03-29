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

export interface SortIconClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type SortIconClassKey = keyof SortIconClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiSortIcon: SortIconProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiSortIcon: keyof SortIconClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiSortIcon?: {
      defaultProps?: ComponentsProps['MuiSortIcon'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiSortIcon'];
      variants?: ComponentsVariants['MuiSortIcon'];
    };
  }
}
//#endregion

export const getSortIconUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiSortIcon', slot);
};

const slots: Record<SortIconClassKey, [SortIconClassKey]> = {
  root: ['root'],
};

export const sortIconClasses: SortIconClasses = generateUtilityClasses(
  'MuiSortIcon',
  Object.keys(slots) as SortIconClassKey[]
);

export interface SortIconProps extends SvgIconProps {}

export const SortIcon = forwardRef<SVGSVGElement, SortIconProps>(
  function SortIcon(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiSortIcon' });
    const { className, ...rest } = props;

    const classes = composeClasses(
      slots,
      getSortIconUtilityClass,
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
        viewBox="0 0 1024 1024"
      >
        <path d="M541.538462 315.076923c11.815385-11.815385 11.815385-29.538462 0-41.353846L317.046154 47.261538c-11.815385-11.815385-29.538462-11.815385-41.353846 0L49.230769 273.723077c-11.815385 11.815385-11.815385 29.538462 0 41.353846l41.353846 41.353846c11.815385 11.815385 29.538462 11.815385 41.353847 0l70.892307-70.892307c11.815385-11.815385 33.476923-3.938462 33.476923 13.784615v417.476923c0 15.753846 13.784615 29.538462 29.538462 29.538462h59.076923c15.753846 0 29.538462-15.753846 29.538461-29.538462V299.323077c0-17.723077 21.661538-25.6 33.476924-13.784615l70.892307 70.892307c11.815385 11.815385 29.538462 11.815385 41.353846 0l41.353847-41.353846z m433.230769 393.846154l-41.353846-39.384615c-11.815385-11.815385-29.538462-11.815385-41.353847 0l-70.892307 70.892307c-11.815385 11.815385-33.476923 3.938462-33.476923-13.784615V305.230769c0-15.753846-13.784615-29.538462-29.538462-29.538461h-59.076923c-15.753846 0-29.538462 15.753846-29.538461 29.538461v417.476923c0 17.723077-21.661538 25.6-33.476924 13.784616l-70.892307-70.892308c-11.815385-11.815385-29.538462-11.815385-41.353846 0L482.461538 708.923077c-11.815385 11.815385-11.815385 29.538462 0 41.353846L708.923077 976.738462c11.815385 11.815385 29.538462 11.815385 41.353846 0l226.461539-226.461539c9.846154-11.815385 9.846154-31.507692-1.969231-41.353846z" />
      </SvgIcon>
    );
  }
);

export default SortIcon;
