import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  alpha,
  unstable_composeClasses as composeClasses,
  darken,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Chip, { ChipProps } from '@mui/material/Chip';
import useTheme from '@mui/material/styles/useTheme';
import clsx from 'clsx';
import { ReactElement, Ref, forwardRef } from 'react';

import Tooltip from './Tooltip';

export interface EnumValueChipClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type EnumValueChipClassKey = keyof EnumValueChipClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiEnumValueChip: EnumValueChipProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiEnumValueChip: keyof EnumValueChipClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiEnumValueChip?: {
      defaultProps?: ComponentsProps['MuiEnumValueChip'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiEnumValueChip'];
      variants?: ComponentsVariants['MuiEnumValueChip'];
    };
  }
}

export interface EnumValueChipProps<Value extends string = string>
  extends ChipProps {
  label?: string;
  value: Value;
  colors: Record<Value, string>;
}

export function getEnumValueChipUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEnumValueChip', slot);
}

export const enumValueChipClasses: EnumValueChipClasses =
  generateUtilityClasses('MuiEnumValueChip', ['root']);

const slots = {
  root: ['root'],
};

export const BaseEnumValueChip = <Value extends string = string>(
  inProps: EnumValueChipProps<Value>,
  ref: Ref<HTMLDivElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiEnumValueChip' });
  const { className, value, colors, variant = 'filled', sx, ...rest } = props;
  let { label } = props;

  const classes = composeClasses(
    slots,
    getEnumValueChipUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  label || (label = value);
  const { palette } = useTheme();

  const { bgcolor, color } = (() => {
    if (colors[value]) {
      return {
        bgcolor: colors[value],
        color: palette.getContrastText(colors[value]),
      };
    }
    return {
      bgcolor: palette.divider,
      color: palette.getContrastText(palette.divider),
    };
  })();

  return (
    <Tooltip title={label} disableInteractive>
      <Chip
        size="small"
        {...rest}
        ref={ref}
        className={clsx(classes.root)}
        {...{ variant, label }}
        sx={{
          ...(() => {
            switch (variant) {
              case 'filled':
                return { color, bgcolor };
              case 'outlined':
                return {
                  color: darken(bgcolor, 0.3),
                  borderColor: bgcolor,
                  bgcolor: alpha(bgcolor, 0.2),
                };
            }
          })(),
          ...sx,
        }}
      />
    </Tooltip>
  );
};

export const EnumValueChip = forwardRef(BaseEnumValueChip) as <
  Value extends string = string
>(
  props: EnumValueChipProps<Value> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default EnumValueChip;
