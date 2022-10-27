import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import TextAreaField, {
  TextAreaFieldProps,
} from '../InputFields/TextAreaField';

export interface FormikTextAreaFieldProps extends TextAreaFieldProps {}

export const FormikTextAreaField = forwardRef<
  HTMLDivElement,
  FormikTextAreaFieldProps
>(function FormikTextAreaField(
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
    <TextAreaField
      ref={ref}
      {...rest}
      {...{ name, value, onChange, onBlur, error, helperText }}
    />
  );
});

export default FormikTextAreaField;
