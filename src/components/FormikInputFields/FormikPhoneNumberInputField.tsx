import { useFormikContext } from 'formik';
import { forwardRef } from 'react';

import {
  IPhoneNumberInputFieldProps,
  PhoneNumberInputField,
} from '../InputFields';

export interface IFormikPhoneNumberInputFieldProps
  extends IPhoneNumberInputFieldProps {}

export const FormikPhoneNumberInputField = forwardRef<
  HTMLDivElement,
  IFormikPhoneNumberInputFieldProps
>(function FormikPhoneNumberInputField(
  {
    name,
    value,
    onBlur: onBlurProp,
    onChange: onChangeProp,
    error: errorProp,
    helperText: helperTextProp,
    ...rest
  },
  ref
) {
  const { values, handleBlur, handleChange, touched, errors } =
    (useFormikContext() as any) || {};

  return (
    <PhoneNumberInputField
      ref={ref}
      {...{
        name,
      }}
      {...rest}
      value={
        value ??
        (() => {
          if (values && name && values[name] != null) {
            return values[name];
          }
        })()
      }
      onChange={onChangeProp ?? handleChange}
      onBlur={onBlurProp ?? handleBlur}
      error={
        errorProp ??
        (() => {
          if (errors && touched && name && touched[name]) {
            return Boolean(errors[name]);
          }
        })()
      }
      helperText={
        helperTextProp ??
        (() => {
          if (errors && touched && name && touched[name]) {
            return errors[name];
          }
        })()
      }
    />
  );
});

export default FormikPhoneNumberInputField;
