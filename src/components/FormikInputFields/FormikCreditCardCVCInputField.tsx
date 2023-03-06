import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import CreditCardCVCInputField, {
  CreditCardCVCInputFieldProps,
} from '../InputFields/CreditCardCVCInputField';

export interface FormikCreditCardCVCInputFieldProps
  extends CreditCardCVCInputFieldProps {}

export const FormikCreditCardCVCInputField = forwardRef<
  HTMLDivElement,
  FormikCreditCardCVCInputFieldProps
>(function FormikCreditCardCVCInputField(
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
    <CreditCardCVCInputField
      ref={ref}
      {...rest}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikCreditCardCVCInputField;
