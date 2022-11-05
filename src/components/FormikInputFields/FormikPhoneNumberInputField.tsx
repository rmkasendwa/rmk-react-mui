import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import PhoneNumberInputField, {
  PhoneNumberInputFieldProps,
} from '../InputFields/PhoneNumberInputField';

export interface FormikPhoneNumberInputFieldProps
  extends PhoneNumberInputFieldProps {}

export const FormikPhoneNumberInputField = forwardRef<
  HTMLDivElement,
  FormikPhoneNumberInputFieldProps
>(function FormikPhoneNumberInputField(
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
    <PhoneNumberInputField
      ref={ref}
      {...rest}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikPhoneNumberInputField;
