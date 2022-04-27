import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks';
import { ITextAreaFieldProps, TextAreaField } from '../InputFields';

export interface IFormikTextAreaFieldProps extends ITextAreaFieldProps {}

export const FormikTextAreaField = forwardRef<
  HTMLDivElement,
  IFormikTextAreaFieldProps
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
