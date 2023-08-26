import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef } from 'react';

import NumberInputField, { NumberInputFieldProps } from './NumberInputField';

export interface PercentageInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type PercentageInputFieldClassKey = keyof PercentageInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiPercentageInputField: PercentageInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiPercentageInputField: keyof PercentageInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiPercentageInputField?: {
      defaultProps?: ComponentsProps['MuiPercentageInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiPercentageInputField'];
      variants?: ComponentsVariants['MuiPercentageInputField'];
    };
  }
}
//#endregion

export const getPercentageInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiPercentageInputField', slot);
};

const slots: Record<
  PercentageInputFieldClassKey,
  [PercentageInputFieldClassKey]
> = {
  root: ['root'],
};

export const percentageInputFieldClasses: PercentageInputFieldClasses =
  generateUtilityClasses(
    'MuiPercentageInputField',
    Object.keys(slots) as PercentageInputFieldClassKey[]
  );

export interface PercentageInputFieldProps extends NumberInputFieldProps {}

export const PercentageInputField = forwardRef<
  HTMLDivElement,
  PercentageInputFieldProps
>(function PercentageInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiPercentageInputField',
  });
  const { className, ...rest } = props;

  const classes = composeClasses(
    slots,
    getPercentageInputFieldUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  return (
    <NumberInputField
      ref={ref}
      min={0}
      max={100}
      decimalPlaces={2}
      valueSuffix="%"
      {...rest}
      className={clsx(classes.root)}
    />
  );
});

export default PercentageInputField;
