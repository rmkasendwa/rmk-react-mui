import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import clsx from 'clsx';
import { forwardRef } from 'react';

import SearchSyncToolbar, { SearchSyncToolbarProps } from './SearchSyncToolbar';

export interface PageTitleClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type PageTitleClassKey = keyof PageTitleClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiPageTitle: PageTitleProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiPageTitle: keyof PageTitleClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiPageTitle?: {
      defaultProps?: ComponentsProps['MuiPageTitle'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiPageTitle'];
      variants?: ComponentsVariants['MuiPageTitle'];
    };
  }
}
//#endregion

export const getPageTitleUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiPageTitle', slot);
};

const slots: Record<PageTitleClassKey, [PageTitleClassKey]> = {
  root: ['root'],
};

export const pageTitleClasses: PageTitleClasses = generateUtilityClasses(
  'MuiPageTitle',
  Object.keys(slots) as PageTitleClassKey[]
);

export interface PageTitleProps extends SearchSyncToolbarProps {}

export const PageTitle = forwardRef<HTMLDivElement, PageTitleProps>(
  function PageTitle(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiPageTitle' });
    const { className, tools, title, TitleProps = {}, ...rest } = props;

    const classes = composeClasses(
      slots,
      getPageTitleUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { sx: titlePropsSx, ...titlePropsRest } = TitleProps;
    const { breakpoints } = useTheme();
    const largeScreen = useMediaQuery(breakpoints.up('sm'));

    return (
      <SearchSyncToolbar
        {...{ tools }}
        title={largeScreen ? title : null}
        hasSearchTool={false}
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        TitleProps={{
          variant: 'h3',
          ...titlePropsRest,
          sx: {
            fontSize: 22,
            lineHeight: '50px',
            [breakpoints.down('md')]: {
              fontSize: 18,
            },
            ...titlePropsSx,
          },
        }}
      />
    );
  }
);

export default PageTitle;
