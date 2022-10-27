import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import FileUploader, { FileUploaderProps } from '../FileUploader';

export interface FormikFileUploaderProps extends FileUploaderProps {}

export const FormikFileUploader = forwardRef<
  HTMLDivElement,
  FormikFileUploaderProps
>(function FormikFileUploader(
  {
    name,
    value: valueProp,
    onChange: onChangeProp,
    error: errorProp,
    helperText: helperTextProp,
    ...rest
  },
  ref
) {
  const { value, onChange, error, helperText } = useAggregatedFormikContext({
    value: valueProp,
    name,
    error: errorProp,
    helperText: helperTextProp,
    onChange: onChangeProp,
  });

  return (
    <FileUploader
      ref={ref}
      {...rest}
      {...{ name, value, onChange, error, helperText }}
    />
  );
});

export default FormikFileUploader;
