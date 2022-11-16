import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  GridProps,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Typography, { TypographyProps } from '@mui/material/Typography';
import clsx from 'clsx';
import { ReactNode, forwardRef } from 'react';

export interface FieldValueClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FieldValueClassKey = keyof FieldValueClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFieldValue: FieldValueProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFieldValue: keyof FieldValueClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFieldValue?: {
      defaultProps?: ComponentsProps['MuiFieldValue'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFieldValue'];
      variants?: ComponentsVariants['MuiFieldValue'];
    };
  }
}

export interface FieldValueProps extends TypographyProps {
  icon?: ReactNode;
  endIcon?: ReactNode;
  IconContainerProps?: Partial<GridProps>;
  EndIconContainerProps?: Partial<GridProps>;
  ContainerGridProps?: Partial<GridProps>;
}

export function getFieldValueUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFieldValue', slot);
}

export const fieldValueClasses: FieldValueClasses = generateUtilityClasses(
  'MuiFieldValue',
  ['root']
);

const slots = {
  root: ['root'],
};

export const FieldValue = forwardRef<HTMLElement, FieldValueProps>(
  function FieldValue(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiFieldValue' });
    const {
      icon,
      endIcon,
      IconContainerProps = {},
      EndIconContainerProps = {},
      ContainerGridProps = {},
      children,
      sx,
      className,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getFieldValueUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { sx: IconContainerPropsSx, ...IconContainerPropsRest } =
      IconContainerProps;
    const { sx: EndIconContainerPropsSx, ...EndIconContainerPropsRest } =
      EndIconContainerProps;
    const { sx: ContainerGridPropsSx, ...ContainerGridPropsRest } =
      ContainerGridProps;

    const { palette, components } = useTheme();

    return (
      <Grid
        {...ContainerGridPropsRest}
        container
        className={clsx(classes.root, className)}
        sx={{ gap: 1, ...ContainerGridPropsSx }}
      >
        {icon ? (
          <Grid
            {...IconContainerPropsRest}
            item
            sx={{
              display: 'flex',
              maxWidth: 24,
              height: 24,
              justifyContent: 'center',
              alignItems: 'center',
              ...IconContainerPropsSx,
            }}
          >
            {icon}
          </Grid>
        ) : null}
        <Grid
          item
          xs
          sx={{
            minWidth: 0,
            maxWidth: 'none !important',
          }}
        >
          <Typography
            ref={ref}
            className={clsx(classes.root)}
            variant="body2"
            component={'div' as any}
            {...rest}
            sx={{
              wordBreak: 'break-word',
              whiteSpace: 'pre-line',
              color: alpha(palette.text.primary, 0.5),
              width: '100%',
              lineHeight: 'inherit',
              ...((components?.MuiFieldValue?.styleOverrides?.root as any) ||
                {}),
              ...sx,
            }}
          >
            {children}
          </Typography>
        </Grid>
        {endIcon ? (
          <Grid
            {...EndIconContainerPropsRest}
            item
            sx={{
              display: 'flex',
              maxWidth: 24,
              height: 24,
              justifyContent: 'center',
              ...EndIconContainerPropsSx,
            }}
          >
            {endIcon}
          </Grid>
        ) : null}
      </Grid>
    );
  }
);

export default FieldValue;
