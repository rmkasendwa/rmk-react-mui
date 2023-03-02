import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Box,
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Grid,
  GridProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { ReactNode, forwardRef, useEffect, useState } from 'react';

export interface CollapsibleSectionClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CollapsibleSectionClassKey = keyof CollapsibleSectionClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCollapsibleSection: CollapsibleSectionProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCollapsibleSection: keyof CollapsibleSectionClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCollapsibleSection?: {
      defaultProps?: ComponentsProps['MuiCollapsibleSection'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCollapsibleSection'];
      variants?: ComponentsVariants['MuiCollapsibleSection'];
    };
  }
}

export interface CollapsibleSectionProps extends Omit<BoxProps, 'title'> {
  title: ReactNode;
  collapsable?: boolean;
  titleIsTypographyContent?: boolean;
  collapsed?: boolean;
  HeaderWrapperProps?: Partial<BoxProps>;
  HeaderProps?: Partial<GridProps>;
  BodyProps?: Partial<BoxProps>;
  collapseIndicatorVariant?: 'leading' | 'trailing';
  color?:
    | 'inherit'
    | 'action'
    | 'disabled'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  onChangeCollapsed?: (collapsed: boolean) => void;
}

export function getCollapsibleSectionUtilityClass(slot: string): string {
  return generateUtilityClass('MuiCollapsibleSection', slot);
}

export const collapsibleSectionClasses: CollapsibleSectionClasses =
  generateUtilityClasses('MuiCollapsibleSection', ['root']);

const slots = {
  root: ['root'],
};

export const CollapsibleSection = forwardRef<
  HTMLDivElement,
  CollapsibleSectionProps
>(function CollapsibleSection(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiCollapsibleSection',
  });
  const {
    className,
    title,
    collapsable = true,
    titleIsTypographyContent = true,
    collapsed: collapsedProp = true,
    HeaderWrapperProps = {},
    HeaderProps = {},
    BodyProps = {},
    children,
    collapseIndicatorVariant = 'trailing',
    color = 'primary',
    onChangeCollapsed,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getCollapsibleSectionUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { sx: headerWrapperPropsSx, ...headerWrapperPropsRest } =
    HeaderWrapperProps;
  const { sx: headerPropsSx, ...headerPropsRest } = HeaderProps;
  const { ...bodyPropsRest } = BodyProps;
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    setCollapsed(collapsedProp);
  }, [collapsedProp]);

  return (
    <Box ref={ref} {...rest} className={clsx(classes.root)}>
      {(() => {
        if (collapsable && titleIsTypographyContent) {
          return (
            <Box
              className="MuiCollapsibleSection-header"
              {...headerWrapperPropsRest}
              sx={{ ...headerWrapperPropsSx }}
            >
              <Grid
                {...headerPropsRest}
                sx={{
                  alignItems: 'center',
                  pb: 3,
                  columnGap: 1,
                  ...headerPropsSx,
                }}
                container
              >
                {collapseIndicatorVariant === 'leading' ? (
                  <Grid
                    item
                    display="flex"
                    onClick={() => {
                      setCollapsed(!collapsed);
                      onChangeCollapsed && onChangeCollapsed(!collapsed);
                    }}
                    sx={{
                      cursor: 'pointer',
                    }}
                  >
                    {collapsed ? (
                      <KeyboardArrowRightIcon {...{ color }} />
                    ) : (
                      <KeyboardArrowDownIcon {...{ color }} />
                    )}
                  </Grid>
                ) : null}
                <Grid item xs sx={{ minWidth: 0 }}>
                  {title}
                </Grid>
                {collapseIndicatorVariant === 'trailing' ? (
                  <Grid
                    item
                    display="flex"
                    onClick={() => {
                      setCollapsed(!collapsed);
                      onChangeCollapsed && onChangeCollapsed(!collapsed);
                    }}
                    sx={{
                      cursor: 'pointer',
                    }}
                  >
                    {collapsed ? (
                      <KeyboardArrowDownIcon {...{ color }} />
                    ) : (
                      <KeyboardArrowUpIcon {...{ color }} />
                    )}
                  </Grid>
                ) : null}
              </Grid>
              <Divider />
            </Box>
          );
        }
        return title;
      })()}
      {collapsed ? null : (
        <Box py={3} {...bodyPropsRest}>
          {children}
        </Box>
      )}
    </Box>
  );
});

export default CollapsibleSection;
