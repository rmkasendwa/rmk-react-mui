import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks';
import { INumberInputFieldProps, NumberInputField } from '../InputFields';

export interface IFormikNumberInputFieldProps extends INumberInputFieldProps {}

export const FormikNumberInputField = forwardRef<
  HTMLDivElement,
  IFormikNumberInputFieldProps
>(function FormikNumberInputField(
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
    <NumberInputField
      ref={ref}
      {...rest}
      {...{ name, value, onChange, onBlur, error, helperText }}
    />
  );
});

export default FormikNumberInputField;
