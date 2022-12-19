import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import { InputProps } from '@mui/material/Input';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { forwardRef } from 'react';

import NumberInputField, { NumberInputFieldProps } from './NumberInputField';

export interface CurrencyInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CurrencyInputFieldClassKey = keyof CurrencyInputFieldClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCurrencyInputField: CurrencyInputFieldProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCurrencyInputField: keyof CurrencyInputFieldClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCurrencyInputField?: {
      defaultProps?: ComponentsProps['MuiCurrencyInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCurrencyInputField'];
      variants?: ComponentsVariants['MuiCurrencyInputField'];
    };
  }
}

export interface CurrencyInputFieldProps extends NumberInputFieldProps {
  showCurrency?: boolean;
  currency?: string;
}

export function getCurrencyInputFieldUtilityClass(slot: string): string {
  return generateUtilityClass('MuiCurrencyInputField', slot);
}

export const currencyInputFieldClasses: CurrencyInputFieldClasses =
  generateUtilityClasses('MuiCurrencyInputField', ['root']);

const slots = {
  root: ['root'],
};

export const CurrencyInputField = forwardRef<
  HTMLDivElement,
  CurrencyInputFieldProps
>(function CurrencyInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiCurrencyInputField',
  });
  const {
    className,
    showCurrency = false,
    currency,
    InputProps,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getCurrencyInputFieldUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const inputProps: InputProps = {};
  if (showCurrency && currency) {
    inputProps.startAdornment = (
      <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold' }}>
        {currency}
      </Typography>
    );
  }
  return (
    <NumberInputField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      step={500}
      decimalPlaces={2}
      {...rest}
      InputProps={{ ...inputProps, ...InputProps }}
    />
  );
});

export default CurrencyInputField;
