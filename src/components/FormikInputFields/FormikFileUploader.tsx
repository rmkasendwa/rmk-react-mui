import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Utils';
import FileUploader, { IFileUploaderProps } from '../FileUploader';

export interface IFormikFileUploaderProps extends IFileUploaderProps {}

export const FormikFileUploader = forwardRef<
  HTMLDivElement,
  IFormikFileUploaderProps
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
