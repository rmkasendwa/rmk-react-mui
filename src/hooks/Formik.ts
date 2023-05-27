import { TextFieldProps } from '@mui/material';
import { FormikContextType, useFormikContext } from 'formik';
import { get, isEmpty } from 'lodash';
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
  const { values, handleBlur, setFieldValue, touched, errors } =
    (useFormikContext() as FormikContextType<any>) || {};

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

  const onChange = useCallback<NonNullable<typeof onChangeProp>>(
    (event) => {
      if (propertyPath && rootPropertyPath) {
        if (event.target.value) {
          setFieldValue(propertyPath, event.target.value);
        } else {
          setFieldValue(rootPropertyPath, undefined);
        }
      }
      onChangeProp && onChangeProp(event);
    },
    [onChangeProp, propertyPath, rootPropertyPath, setFieldValue]
  );

  const onBlur = useCallback<NonNullable<typeof onBlurProp>>(
    (event) => {
      handleBlur && handleBlur(event);
      onBlurProp && onBlurProp(event);
    },
    [handleBlur, onBlurProp]
  );

  return {
    value:
      value ??
      (() => {
        if (values && propertyPath) {
          const value = get(values, propertyPath);
          if (value != null && (typeof value !== 'object' || !isEmpty(value))) {
            return value;
          }
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
