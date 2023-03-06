import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import CreditCardIcon from '../Icons/CreditCardIcon';
import TextField, { TextFieldProps } from './TextField';

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

export const CreditCardNumberInputField = forwardRef<
  HTMLDivElement,
  CreditCardNumberInputFieldProps
>(function CreditCardNumberInputField(
  { name, id, endAdornment, value, onChange, ...rest },
  ref
) {
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
      ref={ref}
      placeholder="1234 5678 9012 3456"
      {...rest}
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
