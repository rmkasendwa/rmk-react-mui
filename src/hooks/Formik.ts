import { TextFieldProps } from '@mui/material';
import { FormikContextType, useFormikContext } from 'formik';
import { get, isEmpty } from 'lodash';
import { useCallback, useMemo, useRef } from 'react';

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

  const setFieldValueRef = useRef(setFieldValue);
  setFieldValueRef.current = setFieldValue;
  const onChangePropRef = useRef(onChangeProp);
  onChangePropRef.current = onChangeProp;
  const onBlurPropRef = useRef(onBlurProp);
  onBlurPropRef.current = onBlurProp;
  const handleBlurRef = useRef(handleBlur);
  handleBlurRef.current = handleBlur;

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
      if (propertyPath) {
        setFieldValueRef.current(propertyPath, event.target.value);
      }
      onChangePropRef.current && onChangePropRef.current(event);
    },
    [propertyPath]
  );

  const onBlur = useCallback<NonNullable<typeof onBlurProp>>((event) => {
    handleBlurRef.current && handleBlurRef.current(event);
    onBlurPropRef.current && onBlurPropRef.current(event);
  }, []);

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
