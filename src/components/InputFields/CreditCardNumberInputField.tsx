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
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import CreditCardIcon from '../Icons/CreditCardIcon';
import TextField, { TextFieldProps } from './TextField';

export interface CreditCardNumberInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CreditCardNumberInputFieldClassKey =
  keyof CreditCardNumberInputFieldClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCreditCardNumberInputField: CreditCardNumberInputFieldProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCreditCardNumberInputField: keyof CreditCardNumberInputFieldClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCreditCardNumberInputField?: {
      defaultProps?: ComponentsProps['MuiCreditCardNumberInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCreditCardNumberInputField'];
      variants?: ComponentsVariants['MuiCreditCardNumberInputField'];
    };
  }
}

export const getValidInputValue = (inputValue: string) => {
  const numericDigitsMatch = inputValue.match(/\d/g);
  if (numericDigitsMatch) {
    return numericDigitsMatch
      .join('')
      .slice(0, 20)
      .match(/\d{1,4}/g)!
      .join(' ');
  }
  return '';
};

export interface CreditCardNumberInputFieldProps
  extends Omit<TextFieldProps, 'value'> {
  value?: string;
}

export function getCreditCardNumberInputFieldUtilityClass(
  slot: string
): string {
  return generateUtilityClass('MuiCreditCardNumberInputField', slot);
}

export const creditCardNumberInputFieldClasses: CreditCardNumberInputFieldClasses =
  generateUtilityClasses('MuiCreditCardNumberInputField', ['root']);

const slots = {
  root: ['root'],
};

export const CreditCardNumberInputField = forwardRef<
  HTMLDivElement,
  CreditCardNumberInputFieldProps
>(function CreditCardNumberInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiCreditCardNumberInputField',
  });
  const { className, name, id, endAdornment, value, onChange, ...rest } = props;

  const classes = composeClasses(
    slots,
    getCreditCardNumberInputFieldUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  // Refs
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const triggerChangeEvent = useCallback(
    (inputValue: string) => {
      if (onChangeRef.current) {
        const event: any = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', {
          writable: false,
          value: {
            name,
            id,
            value: inputValue,
          },
        });
        onChangeRef.current(event);
      }
    },
    [id, name]
  );

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (onChangeRef.current && value != null) {
      setInputValue(getValidInputValue(value));
    }
  }, [value]);

  return (
    <TextField
      placeholder="1234 5678 9012 3456"
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...{ name, id }}
      onChange={(event) => {
        const nextInputValue = getValidInputValue(String(event.target.value));
        if (!onChangeRef.current || value == null) {
          setInputValue(nextInputValue);
        }
        triggerChangeEvent(nextInputValue);
      }}
      value={inputValue}
      endAdornment={
        <>
          {endAdornment}
          <CreditCardIcon />
        </>
      }
    />
  );
});

export default CreditCardNumberInputField;
