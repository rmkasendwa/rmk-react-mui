import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import clsx from 'clsx';
import { ReactNode, forwardRef } from 'react';

import PageTitle, { PageTitleProps } from './PageTitle';

export interface PaddedContentAreaClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type PaddedContentAreaClassKey = keyof PaddedContentAreaClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiPaddedContentArea: PaddedContentAreaProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiPaddedContentArea: keyof PaddedContentAreaClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiPaddedContentArea?: {
      defaultProps?: ComponentsProps['MuiPaddedContentArea'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiPaddedContentArea'];
      variants?: ComponentsVariants['MuiPaddedContentArea'];
    };
  }
}
//#endregion

export const getPaddedContentAreaUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiPaddedContentArea', slot);
};

const slots: Record<PaddedContentAreaClassKey, [PaddedContentAreaClassKey]> = {
  root: ['root'],
};

export const paddedContentAreaClasses: PaddedContentAreaClasses =
  generateUtilityClasses(
    'MuiPaddedContentArea',
    Object.keys(slots) as PaddedContentAreaClassKey[]
  );

export interface PaddedContentAreaProps
  extends Pick<BoxProps, 'sx' | 'className'>,
    Pick<PageTitleProps, 'title' | 'tools'> {
  breadcrumbs?: ReactNode;
  PageTitleProps?: Partial<PageTitleProps>;
  children: ReactNode;
}

export const PaddedContentArea = forwardRef<
  HTMLDivElement,
  PaddedContentAreaProps
>(function PaddedContentArea(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiPaddedContentArea' });
  const {
    className,
    children,
    title,
    sx,
    tools,
    breadcrumbs,
    PageTitleProps = {},
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getPaddedContentAreaUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { sx: PageTitlePropsSx, ...PageTitlePropsRest } = PageTitleProps;
  const { breakpoints } = useTheme();
  const smallScreenBreakpoint = breakpoints.down('sm');
  const largeScreen = useMediaQuery(breakpoints.up('sm'));

  return (
    <Box
      {...rest}
      ref={ref}
      className={clsx(classes.root)}
      sx={{
        flex: 1,
        px: 3,
        [smallScreenBreakpoint]: {
          px: 0,
        },
        ...sx,
      }}
    >
      {breadcrumbs && largeScreen ? breadcrumbs : null}
      {(title && largeScreen) || tools ? (
        <PageTitle
          {...{ title, tools }}
          {...PageTitlePropsRest}
          sx={{
            px: 0,
            ...PageTitlePropsSx,
          }}
        />
      ) : null}
      {children}
    </Box>
  );
});

export default PaddedContentArea;
