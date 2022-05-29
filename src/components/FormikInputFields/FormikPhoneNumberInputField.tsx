import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Utils';
import PhoneNumberInputField, {
  IPhoneNumberInputFieldProps,
} from '../InputFields/PhoneNumberInputField';

export interface IFormikPhoneNumberInputFieldProps
  extends IPhoneNumberInputFieldProps {}

export const FormikPhoneNumberInputField = forwardRef<
  HTMLDivElement,
  IFormikPhoneNumberInputFieldProps
>(function FormikPhoneNumberInputField(
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
    <PhoneNumberInputField
      ref={ref}
      {...rest}
      {...{ name, value, onChange, onBlur, error, helperText }}
    />
  );
});

export default FormikPhoneNumberInputField;
