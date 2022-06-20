import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import TextField, { ITextFieldProps } from '../InputFields/TextField';

export interface IFormikTextFieldProps extends ITextFieldProps {}

export const FormikTextField = forwardRef<
  HTMLDivElement,
  IFormikTextFieldProps
>(function FormikTextField(
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
    <TextField
      ref={ref}
      {...rest}
      {...{ name, value, onChange, onBlur, error, helperText }}
    />
  );
});

export default FormikTextField;
