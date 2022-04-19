import { useFormikContext } from 'formik';
import { forwardRef } from 'react';

import { ITextFieldProps, TextField } from '../InputFields';

export interface IFormikTextFieldProps extends ITextFieldProps {}

export const FormikTextField = forwardRef<
  HTMLDivElement,
  IFormikTextFieldProps
>(function FormikTextField(
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
    <TextField
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

export default FormikTextField;
