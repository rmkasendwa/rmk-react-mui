import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import DateInputField, {
  DateInputFieldProps,
} from '../InputFields/DateInputField';

export interface FormikDateInputFieldProps extends DateInputFieldProps {}

export const FormikDateInputField = forwardRef<
  HTMLDivElement,
  FormikDateInputFieldProps
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
