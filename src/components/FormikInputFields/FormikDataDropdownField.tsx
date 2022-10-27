import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import DataDropdownField, {
  DataDropdownFieldProps,
} from '../InputFields/DataDropdownField';

export interface FormikDataDropdownFieldProps extends DataDropdownFieldProps {}

export const FormikDataDropdownField = forwardRef<
  HTMLDivElement,
  FormikDataDropdownFieldProps
>(function FormikDataDropdownField(
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
    <DataDropdownField
      ref={ref}
      {...rest}
      {...{ name, value, onChange, onBlur, error, helperText }}
    />
  );
});

export default FormikDataDropdownField;
