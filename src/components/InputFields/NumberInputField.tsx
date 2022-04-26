import { forwardRef } from 'react';
import NumberFormat from 'react-number-format';

import { useFormikValue } from '../../hooks';
import TextField, { ITextFieldProps } from './TextField';

export interface INumberInputFieldProps extends ITextFieldProps {
  setFieldValue?: (value: number) => void;
}

const NumberField = forwardRef(function NumberField(
  { onValueChange, ...rest }: any,
  inputRef: any
) {
  const getInputRef = (inputField: HTMLInputElement) => {
    if (inputField) {
      const descriptor = Object.getOwnPropertyDescriptor(inputField, 'value');
      if (descriptor?.get) {
        const get = descriptor.get;
        Object.defineProperty(inputField, 'value', {
          get() {
            return String(get.call(this)).replace(/\D/g, '');
          },
        });
      }
    }
    inputRef(inputField);
  };
  return (
    <NumberFormat
      {...rest}
      getInputRef={getInputRef}
      onValueChange={(values: { floatValue: any }) => {
        onValueChange(values.floatValue);
      }}
      thousandSeparator
    />
  );
});

export const NumberInputField = forwardRef<
  HTMLDivElement,
  INumberInputFieldProps
>(function NumberInputField(
  { setFieldValue, InputProps, value, name, ...rest },
  ref
) {
  value = useFormikValue({ value, name });

  return (
    <TextField
      ref={ref}
      {...rest}
      {...{ name, value }}
      InputProps={{
        ...(InputProps || {}),
        inputComponent: NumberField,
        inputProps: {
          onValueChange: (value: number) => {
            typeof setFieldValue === 'function' && setFieldValue(value);
          },
        },
      }}
    />
  );
});

export default NumberInputField;
