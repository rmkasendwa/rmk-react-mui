import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import CreditCardExpiryDateInputField, {
  CreditCardExpiryDateInputFieldProps,
} from '../InputFields/CreditCardExpiryDateInputField';

export interface FormikCreditCardExpiryDateInputFieldProps
  extends CreditCardExpiryDateInputFieldProps {}

export const FormikCreditCardExpiryDateInputField = forwardRef<
  HTMLDivElement,
  FormikCreditCardExpiryDateInputFieldProps
>(function FormikCreditCardExpiryDateInputField(
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
    <CreditCardExpiryDateInputField
      ref={ref}
      {...rest}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikCreditCardExpiryDateInputField;
