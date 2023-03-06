import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import TextField, { TextFieldProps } from './TextField';

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
>(function CreditCardExpiryDateInputField(
  { name, id, value, onChange, ...rest },
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
      placeholder="MM/YY"
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
    />
  );
});

export default CreditCardExpiryDateInputField;
