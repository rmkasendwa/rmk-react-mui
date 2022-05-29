import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Utils';
import DateInputField, {
  IDateInputFieldProps,
} from '../InputFields/DateInputField';

export interface IFormikDateInputFieldProps extends IDateInputFieldProps {}

export const FormikDateInputField = forwardRef<
  HTMLDivElement,
  IFormikDateInputFieldProps
>(function FormikDateInputField(
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
    <DateInputField
      ref={ref}
      {...rest}
      {...{ name, value, onChange, onBlur, error, helperText }}
    />
  );
});

export default FormikDateInputField;
