import CircleIcon from '@mui/icons-material/Circle';
import {
  Box,
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { ReactNode, forwardRef } from 'react';

export interface UnorderedListClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type UnorderedListClassKey = keyof UnorderedListClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiUnorderedList: UnorderedListProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiUnorderedList: keyof UnorderedListClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiUnorderedList?: {
      defaultProps?: ComponentsProps['MuiUnorderedList'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiUnorderedList'];
      variants?: ComponentsVariants['MuiUnorderedList'];
    };
  }
}

export interface UnorderedListProps extends Partial<BoxProps> {
  children: ReactNode[];
}

export function getUnorderedListUtilityClass(slot: string): string {
  return generateUtilityClass('MuiUnorderedList', slot);
}

export const unorderedListClasses: UnorderedListClasses =
  generateUtilityClasses('MuiUnorderedList', ['root']);

const slots = {
  root: ['root'],
};

export const UnorderedList = forwardRef<HTMLDivElement, UnorderedListProps>(
  function UnorderedList(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiUnorderedList' });
    const { children, sx, className, ...rest } = props;

    const classes = composeClasses(
      slots,
      getUnorderedListUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    return (
      <Box
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        sx={{
          p: 0,
          m: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          ...sx,
        }}
      >
        {children.map((element, index) => {
          return (
            <Grid key={index} container>
              <Grid item sx={{ display: 'flex', width: 10, pt: 1 }}>
                <CircleIcon sx={{ fontSize: 6 }} />
              </Grid>
              <Grid item xs sx={{ minWidth: 0 }}>
                <Typography variant="body2">{element}</Typography>
              </Grid>
            </Grid>
          );
        })}
      </Box>
    );
  }
);

export default UnorderedList;
