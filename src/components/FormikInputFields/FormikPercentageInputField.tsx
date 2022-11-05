import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import PercentageInputField, {
  PercentageInputFieldProps,
} from '../InputFields/PercentageInputField';

export interface FormikPercentageInputFieldProps
  extends PercentageInputFieldProps {}

export const FormikPercentageInputField = forwardRef<
  HTMLDivElement,
  FormikPercentageInputFieldProps
>(function FormikPercentageInputField(
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
    <PercentageInputField
      ref={ref}
      {...rest}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikPercentageInputField;
