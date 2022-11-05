import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import NumberInputField, {
  NumberInputFieldProps,
} from '../InputFields/NumberInputField';

export interface FormikNumberInputFieldProps extends NumberInputFieldProps {}

export const FormikNumberInputField = forwardRef<
  HTMLDivElement,
  FormikNumberInputFieldProps
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
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikNumberInputField;
