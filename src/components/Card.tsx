import {
  Box,
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Card as MuiCard,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  gridClasses,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Paper, { PaperProps } from '@mui/material/Paper';
import clsx from 'clsx';
import { ReactNode, forwardRef } from 'react';

import { useLoadingContext } from '../contexts/LoadingContext';
import { LoadingProps } from '../models/Utils';
import ReloadIconButton from './ReloadIconButton';
import SearchSyncToolbar, { SearchSyncToolbarProps } from './SearchSyncToolbar';

export interface CardClasses {
  /** Styles applied to the root element. */
  root: string;
  header: string;
  section: string;
}

export type CardClassKey = keyof CardClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCardWithTools: CardProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCardWithTools: keyof CardClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCardWithTools?: {
      defaultProps?: ComponentsProps['MuiCardWithTools'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCardWithTools'];
      variants?: ComponentsVariants['MuiCardWithTools'];
    };
  }
}

export interface CardProps
  extends Partial<Omit<PaperProps, 'title'>>,
    Partial<LoadingProps> {
  title?: ReactNode;
  load?: () => void;
  SearchSyncToolbarProps?: Partial<SearchSyncToolbarProps>;
  CardBodyProps?: Partial<BoxProps>;
  layoutVariant?: 'paper' | 'card' | 'inherit';
  wrapToolbarInCard?: boolean;
  showToolbarDivider?: boolean;
}

export function getCardUtilityClass(slot: string): string {
  return generateUtilityClass('MuiCardWithTools', slot);
}

export const cardClasses: CardClasses = generateUtilityClasses(
  'MuiCardWithTools',
  ['root', 'header', 'section']
);

const slots = {
  root: ['root'],
  header: ['header'],
  section: ['section'],
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  inProps,
  ref
) {
  const props = useThemeProps({ props: inProps, name: 'MuiCardWithTools' });
  const {
    className,
    children,
    title,
    load,
    loading,
    errorMessage,
    SearchSyncToolbarProps = {},
    CardBodyProps = {},
    layoutVariant = 'paper',
    wrapToolbarInCard = false,
    showToolbarDivider = true,
    sx,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getCardUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { sx: SearchSyncToolbarPropsSx, ...SearchSyncToolbarPropsRest } =
    SearchSyncToolbarProps;
  const {
    sx: CardBodyPropsSx,
    className: CardBodyPropsClassName,
    ...CardBodyPropsRest
  } = CardBodyProps;
  const { loading: contextLoading, errorMessage: contextErrorMessage } =
    useLoadingContext();
  const { spacing, breakpoints } = useTheme();
  const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));

  const searchSyncToolBar = (
    <SearchSyncToolbar
      load={load}
      loading={loading || contextLoading}
      errorMessage={errorMessage || contextErrorMessage}
      title={title}
      hasSearchTool={false}
      {...SearchSyncToolbarPropsRest}
      sx={{
        ...(() => {
          if (
            (['card', 'inherit'] as (typeof layoutVariant)[]).includes(
              layoutVariant
            )
          ) {
            return {
              px: '0 !important',
            };
          }
          return {
            pr: `${spacing(1.75)} !important`,
          };
        })(),
        [`&>.${gridClasses.container}`]: {
          columnGap: 1,
        },
        ...SearchSyncToolbarPropsSx,
      }}
    />
  );

  if (layoutVariant === 'card') {
    if (wrapToolbarInCard) {
      return (
        <MuiCard ref={ref} {...rest} className={clsx(classes.root)} sx={sx}>
          <Box
            sx={{
              pl: 3,
              pr: 2,
            }}
          >
            {searchSyncToolBar}
          </Box>
          {showToolbarDivider ? <Divider /> : null}
          {children}
        </MuiCard>
      );
    }
    return (
      <Box ref={ref} {...rest} className={clsx(classes.root)}>
        {searchSyncToolBar}
        <MuiCard>{children}</MuiCard>
      </Box>
    );
  }

  if (layoutVariant === 'inherit') {
    return (
      <Box ref={ref} {...rest} className={clsx(classes.root)} sx={sx}>
        <Box
          sx={{
            pl: 3,
            pr: 2,
          }}
        >
          {searchSyncToolBar}
        </Box>
        {showToolbarDivider ? <Divider /> : null}
        {children}
      </Box>
    );
  }

  return (
    <Paper
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      sx={{
        position: 'relative',
        ...sx,
      }}
    >
      {(() => {
        if (title) {
          return (
            <Paper
              elevation={0}
              component="header"
              className={clsx(classes.header)}
              sx={{ position: 'sticky', top: 0, zIndex: 5 }}
            >
              {searchSyncToolBar}
              {showToolbarDivider ? <Divider /> : null}
            </Paper>
          );
        }
        if (load || loading || errorMessage) {
          return (
            <ReloadIconButton
              {...{ load, loading, errorMessage }}
              sx={{
                position: 'absolute',
                top: spacing(1),
                right: spacing(1),
                zIndex: 1,
              }}
            />
          );
        }
      })()}
      <Box
        {...CardBodyPropsRest}
        className={clsx(classes.section, CardBodyPropsClassName)}
        component="section"
        sx={{
          pt: isSmallScreenSize ? 1 : 2,
          px: isSmallScreenSize ? 2 : 3,
          pb: isSmallScreenSize ? 2 : 3,
          ...CardBodyPropsSx,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
});

export default Card;
