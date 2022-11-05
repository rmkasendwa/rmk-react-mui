import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import FileInputField, {
  FileInputFieldProps,
} from '../InputFields/FileInputField';

export interface FormikFileInputFieldProps extends FileInputFieldProps {}

export const FormikFileInputField = forwardRef<
  HTMLDivElement,
  FormikFileInputFieldProps
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
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikFileInputField;
