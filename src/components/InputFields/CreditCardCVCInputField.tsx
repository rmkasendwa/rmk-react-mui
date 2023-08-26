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

import CreditCardCVCIcon from '../Icons/CreditCardCVCIcon';
import TextField, { TextFieldProps } from './TextField';

export interface CreditCardCVCInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CreditCardCVCInputFieldClassKey =
  keyof CreditCardCVCInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiCreditCardCVCInputField: CreditCardCVCInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiCreditCardCVCInputField: keyof CreditCardCVCInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiCreditCardCVCInputField?: {
      defaultProps?: ComponentsProps['MuiCreditCardCVCInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiCreditCardCVCInputField'];
      variants?: ComponentsVariants['MuiCreditCardCVCInputField'];
    };
  }
}
//#endregion

export const getCreditCardCVCInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiCreditCardCVCInputField', slot);
};

const slots: Record<
  CreditCardCVCInputFieldClassKey,
  [CreditCardCVCInputFieldClassKey]
> = {
  root: ['root'],
};

export const creditCardCVCInputFieldClasses: CreditCardCVCInputFieldClasses =
  generateUtilityClasses(
    'MuiCreditCardCVCInputField',
    Object.keys(slots) as CreditCardCVCInputFieldClassKey[]
  );

export const getValidInputValue = (inputValue: string) => {
  const numericDigitsMatch = inputValue.match(/\d/g);
  if (numericDigitsMatch) {
    return numericDigitsMatch.join('').slice(0, 3);
  }
  return '';
};

export interface CreditCardCVCInputFieldProps
  extends Omit<TextFieldProps, 'value'> {
  value?: string;
}

export const CreditCardCVCInputField = forwardRef<
  HTMLDivElement,
  CreditCardCVCInputFieldProps
>(function CreditCardCVCInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiCreditCardCVCInputField',
  });
  const { className, name, id, endAdornment, value, onChange, ...rest } = props;

  const classes = composeClasses(
    slots,
    getCreditCardCVCInputFieldUtilityClass,
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
      placeholder="3 digits"
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
          <CreditCardCVCIcon />
        </>
      }
    />
  );
});

export default CreditCardCVCInputField;
