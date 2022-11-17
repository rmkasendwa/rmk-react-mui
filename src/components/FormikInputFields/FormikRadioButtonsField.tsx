import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import RadioButtonsField, {
  RadioButtonsFieldProps,
} from '../InputFields/RadioButtonsField';

export interface FormikRadioButtonsFieldProps extends RadioButtonsFieldProps {}

export const FormikRadioButtonsField = forwardRef<
  HTMLDivElement,
  FormikRadioButtonsFieldProps
>(function FormikRadioButtonsField(
  {
    name,
    value: valueProp,
    error: errorProp,
    helperText: helperTextProp,
    ...rest
  },
  ref
) {
  const {
    value = '',
    onChange,
    error,
    helperText,
  } = useAggregatedFormikContext({
    value: valueProp,
    name,
    error: errorProp,
    helperText: helperTextProp,
  });

  return (
    <RadioButtonsField
      ref={ref}
      {...rest}
      {...{ name, value, onChange, error, helperText }}
    />
  );
});

export default FormikRadioButtonsField;
