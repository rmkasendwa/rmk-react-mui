import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  Tooltip,
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

export interface FieldLabelClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FieldLabelClassKey = keyof FieldLabelClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFieldLabel: FieldLabelProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFieldLabel: keyof FieldLabelClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFieldLabel?: {
      defaultProps?: ComponentsProps['MuiFieldLabel'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFieldLabel'];
      variants?: ComponentsVariants['MuiFieldLabel'];
    };
  }
}

export interface FieldLabelProps extends LoadingTypographyProps {
  required?: boolean;
  enableLoadingState?: boolean;
  labelSuffix?: ReactNode;
  helpTip?: ReactNode;
}

export function getFieldLabelUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFieldLabel', slot);
}

export const fieldLabelClasses: FieldLabelClasses = generateUtilityClasses(
  'MuiFieldLabel',
  ['root']
);

const slots = {
  root: ['root'],
};

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
      sx,
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

    return (
      <Grid container>
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
          </LabelComponent>
        </Grid>
        {(() => {
          if (required) {
            return (
              <Grid item>
                <LabelComponent sx={{ ml: 1, color: palette.error.main }}>
                  *
                </LabelComponent>
              </Grid>
            );
          }
        })()}
        {(() => {
          if (helpTip) {
            return (
              <Grid item>
                <Tooltip
                  title={helpTip}
                  sx={{
                    display: 'flex',
                  }}
                >
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
        <Grid item xs />
        {(() => {
          if (labelSuffix) {
            return <Grid item>{labelSuffix}</Grid>;
          }
        })()}
      </Grid>
    );
  }
);

export default FieldLabel;
