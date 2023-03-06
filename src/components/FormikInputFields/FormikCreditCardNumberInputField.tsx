import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import CreditCardNumberInputField, {
  CreditCardNumberInputFieldProps,
} from '../InputFields/CreditCardNumberInputField';

export interface FormikCreditCardNumberInputFieldProps
  extends CreditCardNumberInputFieldProps {}

export const FormikCreditCardNumberInputField = forwardRef<
  HTMLDivElement,
  FormikCreditCardNumberInputFieldProps
>(function FormikCreditCardNumberInputField(
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
    <CreditCardNumberInputField
      ref={ref}
      {...rest}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikCreditCardNumberInputField;
