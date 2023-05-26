import { TextFieldProps } from '@mui/material';
import { FormikContextType, useFormikContext } from 'formik';
import { get } from 'lodash';
import { useCallback, useMemo } from 'react';

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
      handleChange && handleChange(event);
      onChangeProp && onChangeProp(event);
    },
    [handleChange, onChangeProp]
  );

  const onBlur = useCallback<NonNullable<typeof onBlurProp>>(
    (event) => {
      handleBlur && handleBlur(event);
      onBlurProp && onBlurProp(event);
    },
    [handleBlur, onBlurProp]
  );

  const { rootPropertyPath, propertyPath } = useMemo((): {
    rootPropertyPath?: string;
    propertyPath?: string;
  } => {
    if (name) {
      return {
        rootPropertyPath: name.split('.')[0],
        propertyPath: name,
      };
    }
    return {};
  }, [name]);

  return {
    value:
      value ??
      (() => {
        if (values && propertyPath && get(values, propertyPath) != null) {
          return get(values, propertyPath);
        }
      })(),
    onChange,
    onBlur,
    error:
      error ??
      (() => {
        if (
          errors &&
          touched &&
          rootPropertyPath &&
          propertyPath &&
          get(touched, rootPropertyPath)
        ) {
          return Boolean(get(errors, propertyPath));
        }
      })(),
    helperText: (helperText ??
      (() => {
        if (
          errors &&
          touched &&
          rootPropertyPath &&
          propertyPath &&
          get(touched, rootPropertyPath)
        ) {
          return get(errors, propertyPath);
        }
      })()) as typeof helperText,
  };
};
