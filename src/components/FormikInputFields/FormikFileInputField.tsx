import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks';
import { FileInputField, IFileInputFieldProps } from '../InputFields';

export interface IFormikFileInputFieldProps extends IFileInputFieldProps {}

export const FormikFileInputField = forwardRef<
  HTMLDivElement,
  IFormikFileInputFieldProps
>(function FormikFileInputField(
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
    <FileInputField
      ref={ref}
      {...rest}
      {...{ name, value, onChange, onBlur, error, helperText }}
    />
  );
});

export default FormikFileInputField;
