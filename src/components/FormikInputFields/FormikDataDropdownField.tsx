import { ReactElement, Ref, forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import DataDropdownField, {
  DataDropdownFieldProps,
} from '../InputFields/DataDropdownField';

export interface FormikDataDropdownFieldProps<Entity = any>
  extends DataDropdownFieldProps<Entity> {}

const BaseFormikDataDropdownField = <Entity,>(
  {
    name,
    value: valueProp,
    onBlur: onBlurProp,
    onChange: onChangeProp,
    error: errorProp,
    helperText: helperTextProp,
    ...rest
  }: DataDropdownFieldProps<Entity>,
  ref: Ref<HTMLDivElement>
) => {
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
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
};

export const FormikDataDropdownField = forwardRef(
  BaseFormikDataDropdownField
) as <Entity>(
  p: FormikDataDropdownFieldProps<Entity> & {
    ref?: Ref<HTMLDivElement>;
  }
) => ReactElement;

export default FormikDataDropdownField;
