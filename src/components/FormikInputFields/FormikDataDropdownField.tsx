import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Utils';
import DataDropdownField, {
  IDataDropdownFieldProps,
} from '../InputFields/DataDropdownField';

export interface IFormikDataDropdownFieldProps
  extends IDataDropdownFieldProps {}

export const FormikDataDropdownField = forwardRef<
  HTMLDivElement,
  IFormikDataDropdownFieldProps
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
