import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks';
import { IPasswordFieldProps, PasswordField } from '../InputFields';

export interface IFormikPasswordFieldProps extends IPasswordFieldProps {}

export const FormikPasswordField = forwardRef<
  HTMLDivElement,
  IFormikPasswordFieldProps
>(function FormikPasswordField(
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
    <PasswordField
      ref={ref}
      {...rest}
      {...{ name, value, onChange, onBlur, error, helperText }}
    />
  );
});

export default FormikPasswordField;
