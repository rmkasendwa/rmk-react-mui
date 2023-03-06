import { forwardRef, useEffect, useRef, useState } from 'react';

import CreditCardIcon from '../Icons/CreditCardIcon';
import TextField, { TextFieldProps } from './TextField';

export interface CreditCardNumberInputFieldProps
  extends Omit<TextFieldProps, 'value'> {
  value?: string;
}

export const CreditCardNumberInputField = forwardRef<
  HTMLDivElement,
  CreditCardNumberInputFieldProps
>(function CreditCardNumberInputField(
  { name, id, disabled, endAdornment, ...rest },
  ref
) {
  const initialRenderRef = useRef(true);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    initialRenderRef.current = false;
    return () => {
      initialRenderRef.current = true;
    };
  }, []);

  return (
    <TextField
      ref={ref}
      placeholder="1234 5678 9012 3456"
      {...rest}
      {...{ name, id, disabled }}
      onChange={(event) => {
        const numericDigitsMatch = String(event.target.value).match(/\d/g);
        if (numericDigitsMatch) {
          setInputValue(
            numericDigitsMatch
              .join('')
              .slice(0, 20)
              .match(/\d{1,4}/g)!
              .join(' ')
          );
        } else {
          setInputValue('');
        }
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
