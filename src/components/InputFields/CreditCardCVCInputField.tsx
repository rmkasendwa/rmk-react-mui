import { forwardRef, useState } from 'react';

import CreditCardCVCIcon from '../Icons/CreditCardCVCIcon';
import TextField, { TextFieldProps } from './TextField';

export interface CreditCardCVCInputFieldProps
  extends Omit<TextFieldProps, 'value'> {
  value?: string;
}

export const CreditCardCVCInputField = forwardRef<
  HTMLDivElement,
  CreditCardCVCInputFieldProps
>(function CreditCardCVCInputField(
  { name, id, disabled, endAdornment, ...rest },
  ref
) {
  const [inputValue, setInputValue] = useState('');
  return (
    <TextField
      ref={ref}
      placeholder="3 digits"
      {...rest}
      {...{ name, id, disabled }}
      onChange={(event) => {
        const numericDigitsMatch = String(event.target.value).match(/\d/g);
        if (numericDigitsMatch) {
          setInputValue(numericDigitsMatch.join('').slice(0, 3));
        } else {
          setInputValue('');
        }
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
