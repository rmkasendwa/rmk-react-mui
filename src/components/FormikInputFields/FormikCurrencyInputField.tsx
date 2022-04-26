import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks';
import { CurrencyInputField, ICurrencyInputFieldProps } from '../InputFields';

export interface IFormikCurrencyInputFieldProps
  extends ICurrencyInputFieldProps {}

export const FormikCurrencyInputField = forwardRef<
  HTMLDivElement,
  IFormikCurrencyInputFieldProps
>(function FormikCurrencyInputField(
  {
    name,
    value: valueProp,
    onBlur: onBlurProp,
    onChange: onChangeProp,
    error: errorProp,
    helperText: helperTextProp,
    ...rest
  },
  ref
) {
  const { value, onChange, onBlur, error, helperText } =
    useAggregatedFormikContext({
      value: valueProp,
      name,
      error: errorProp,
      helperText: helperTextProp,
      onBlur: onBlurProp,
      onChange: onChangeProp,
    });

  return (
    <CurrencyInputField
      ref={ref}
      {...rest}
      {...{ name, value, onChange, onBlur, error, helperText }}
    />
  );
});

export default FormikCurrencyInputField;
