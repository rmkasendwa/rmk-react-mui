import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import CurrencyInputField, {
  CurrencyInputFieldProps,
} from '../InputFields/CurrencyInputField';

export interface FormikCurrencyInputFieldProps
  extends CurrencyInputFieldProps {}

export const FormikCurrencyInputField = forwardRef<
  HTMLDivElement,
  FormikCurrencyInputFieldProps
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
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikCurrencyInputField;
