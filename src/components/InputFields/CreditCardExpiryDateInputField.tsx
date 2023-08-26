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

import TextField, { TextFieldProps } from './TextField';

export interface CreditCardExpiryDateInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CreditCardExpiryDateInputFieldClassKey =
  keyof CreditCardExpiryDateInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCreditCardExpiryDateInputField: CreditCardExpiryDateInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCreditCardExpiryDateInputField: keyof CreditCardExpiryDateInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCreditCardExpiryDateInputField?: {
      defaultProps?: ComponentsProps['MuiCreditCardExpiryDateInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCreditCardExpiryDateInputField'];
      variants?: ComponentsVariants['MuiCreditCardExpiryDateInputField'];
    };
  }
}
//#endregion

export const getCreditCardExpiryDateInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiCreditCardExpiryDateInputField', slot);
};

const slots: Record<
  CreditCardExpiryDateInputFieldClassKey,
  [CreditCardExpiryDateInputFieldClassKey]
> = {
  root: ['root'],
};

export const creditCardExpiryDateInputFieldClasses: CreditCardExpiryDateInputFieldClasses =
  generateUtilityClasses(
    'MuiCreditCardExpiryDateInputField',
    Object.keys(slots) as CreditCardExpiryDateInputFieldClassKey[]
  );

export const getValidInputValue = (inputValue: string) => {
  const numericDigitsMatch = inputValue.match(/\d{1,2}\/?\d{0,2}/);
  if (numericDigitsMatch) {
    const dateString = numericDigitsMatch
      .join('')
      .replace(/\//, '')
      .match(/\d{1,2}/g)!
      .join('/');

    if (dateString.match(/^\d{2}$/)) {
      return `${dateString}/`;
    }
    return dateString;
  }
  return '';
};

export interface CreditCardExpiryDateInputFieldProps
  extends Omit<TextFieldProps, 'value'> {
  value?: string;
}

export const CreditCardExpiryDateInputField = forwardRef<
  HTMLDivElement,
  CreditCardExpiryDateInputFieldProps
>(function CreditCardExpiryDateInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiCreditCardExpiryDateInputField',
  });
  const { className, name, id, value, onChange, ...rest } = props;

  const classes = composeClasses(
    slots,
    getCreditCardExpiryDateInputFieldUtilityClass,
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
      placeholder="MM/YY"
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
    />
  );
});

export default CreditCardExpiryDateInputField;
