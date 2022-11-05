import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import PasswordField, {
  PasswordFieldProps,
} from '../InputFields/PasswordField';

export interface FormikPasswordFieldProps extends PasswordFieldProps {}

export const FormikPasswordField = forwardRef<
  HTMLDivElement,
  FormikPasswordFieldProps
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
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikPasswordField;
