import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks';
import {
  IPercentageInputFieldProps,
  PercentageInputField,
} from '../InputFields';

export interface IFormikPercentageInputFieldProps
  extends IPercentageInputFieldProps {}

export const FormikPercentageInputField = forwardRef<
  HTMLDivElement,
  IFormikPercentageInputFieldProps
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
      {...{ name, value, onChange, onBlur, error, helperText }}
    />
  );
});

export default FormikPercentageInputField;
