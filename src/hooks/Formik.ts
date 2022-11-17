import { TextFieldProps } from '@mui/material';
import { FormikContextType, useFormikContext } from 'formik';
import { get } from 'lodash';
import { useCallback } from 'react';

interface UseAggregatedFormikContextProps
  extends Pick<
    TextFieldProps,
    'value' | 'name' | 'onChange' | 'onBlur' | 'helperText' | 'error'
  > {}

export const useAggregatedFormikContext = ({
  value,
  name,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  helperText,
  error,
}: UseAggregatedFormikContextProps) => {
  const { values, handleBlur, handleChange, touched, errors } =
    (useFormikContext() as FormikContextType<any>) || {};

  const onChange = useCallback<NonNullable<typeof onChangeProp>>(
    (event) => {
      onChangeProp && onChangeProp(event);
      handleChange && handleChange(event);
    },
    [handleChange, onChangeProp]
  );

  const onBlur = useCallback<NonNullable<typeof onBlurProp>>(
    (event) => {
      onBlurProp && onBlurProp(event);
      handleBlur && handleBlur(event);
    },
    [handleBlur, onBlurProp]
  );

  return {
    value:
      value ??
      (() => {
        if (values && name && get(values, name) != null) {
          return get(values, name);
        }
      })(),
    onChange,
    onBlur,
    error:
      error ??
      (() => {
        if (errors && touched && name && get(touched, name)) {
          return Boolean(get(errors, name));
        }
      })(),
    helperText: (helperText ??
      (() => {
        if (errors && touched && name && get(touched, name)) {
          return get(errors, name);
        }
      })()) as typeof helperText,
  };
};
