import { forwardRef } from 'react';
import * as Yup from 'yup';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import { isValidPhoneNumber } from '../../utils/PhoneNumberUtil';
import PhoneNumberInputField, {
  PhoneNumberInputFieldProps,
} from '../InputFields/PhoneNumberInputField';

declare module 'yup' {
  interface StringSchema {
    phoneNumber(): StringSchema;
  }
}

Yup.addMethod(Yup.mixed, 'phoneNumber', function () {
  return this.test(
    'phoneNumber',
    'Please enter a valid phone number',
    function (value) {
      return (
        value == null ||
        String(value).trim() == '' ||
        (typeof value === 'string' && Boolean(isValidPhoneNumber(value)))
      );
    }
  );
});

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
