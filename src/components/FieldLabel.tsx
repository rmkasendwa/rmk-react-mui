import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  GridProps,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { ReactNode, forwardRef } from 'react';

import LoadingTypography, { LoadingTypographyProps } from './LoadingTypography';
import Tooltip from './Tooltip';

export interface FieldLabelClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FieldLabelClassKey = keyof FieldLabelClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFieldLabel: FieldLabelProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFieldLabel: keyof FieldLabelClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFieldLabel?: {
      defaultProps?: ComponentsProps['MuiFieldLabel'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFieldLabel'];
      variants?: ComponentsVariants['MuiFieldLabel'];
    };
  }
}
//#endregion

export const getFieldLabelUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFieldLabel', slot);
};

const slots: Record<FieldLabelClassKey, [FieldLabelClassKey]> = {
  root: ['root'],
};

export const fieldLabelClasses: FieldLabelClasses = generateUtilityClasses(
  'MuiFieldLabel',
  Object.keys(slots) as FieldLabelClassKey[]
);

export interface FieldLabelProps extends LoadingTypographyProps {
  required?: boolean;
  enableLoadingState?: boolean;
  labelSuffix?: ReactNode;
  helpTip?: ReactNode;
  disabled?: boolean;
  slotProps?: {
    containerGrid?: Partial<GridProps>;
  };
}

export const FieldLabel = forwardRef<HTMLElement, FieldLabelProps>(
  function FieldLabel(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiFieldLabel' });
    const {
      required,
      children,
      className,
      enableLoadingState = true,
      labelSuffix,
      helpTip,
      disabled,
      sx,
      slotProps: { containerGrid: ContainerGridProps = {} } = {},
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getFieldLabelUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { palette, components } = useTheme();

    const LabelComponent = enableLoadingState ? LoadingTypography : Typography;
    const { sx: ContainerGridPropsSx, ...ContainerGridPropsRest } =
      ContainerGridProps;

    return (
      <Grid
        {...ContainerGridPropsRest}
        container
        sx={{
          alignItems: 'center',
          ...ContainerGridPropsSx,
          ...(() => {
            if (disabled) {
              return {
                opacity: 0.3,
              };
            }
          })(),
        }}
      >
        <Grid
          item
          sx={{
            minWidth: 0,
          }}
        >
          <LabelComponent
            ref={ref as any}
            className={clsx(classes.root, className)}
            {...{ component: 'div' }}
            variant="body2"
            noWrap
            {...rest}
            sx={{
              fontWeight: 500,
              ...((components?.MuiFieldLabel?.styleOverrides?.root as any) ||
                {}),
              ...sx,
            }}
          >
            {children}
            {(() => {
              if (required) {
                return (
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 500,
                      ...((components?.MuiFieldLabel?.styleOverrides
                        ?.root as any) || {}),
                      ...sx,
                      ml: 1,
                      color: palette.error.main,
                    }}
                  >
                    *
                  </Box>
                );
              }
            })()}
          </LabelComponent>
        </Grid>
        {(() => {
          if (helpTip) {
            return (
              <Grid
                item
                sx={{
                  display: 'flex',
                }}
              >
                <Tooltip title={helpTip}>
                  <InfoOutlinedIcon
                    sx={{
                      fontSize: 16,
                      ml: 2,
                      color: palette.text.secondary,
                    }}
                  />
                </Tooltip>
              </Grid>
            );
          }
        })()}
        {(() => {
          if (labelSuffix) {
            return (
              <>
                <Grid item xs />
                <Grid item>{labelSuffix}</Grid>
              </>
            );
          }
        })()}
      </Grid>
    );
  }
);

export default FieldLabel;
