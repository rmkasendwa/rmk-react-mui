import {
  TextField as MuiTextField,
  Skeleton,
  TextFieldProps,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { forwardRef } from 'react';

import { useLoadingContext } from '../../hooks';
import ErrorSkeleton from '../ErrorSkeleton';

export interface ITextFieldProps
  extends Omit<TextFieldProps, 'variant'>,
    Pick<TextFieldProps, 'variant'> {}

export const TextField = forwardRef<HTMLDivElement, ITextFieldProps>(
  function TextField(
    {
      label,
      required,
      variant,
      size,
      multiline,
      rows,
      fullWidth,
      name,
      value,
      onBlur,
      onChange,
      error,
      helperText,
      ...rest
    },
    ref
  ) {
    const { loading, errorMessage } = useLoadingContext();
    const { values, handleBlur, handleChange, touched, errors } =
      (useFormikContext() as any) || {};

    const labelSkeletonWidth = typeof label === 'string' ? label.length * 7 : 0;

    if (errorMessage) {
      return (
        <MuiTextField
          {...{ size, variant, multiline, rows, fullWidth }}
          label={<ErrorSkeleton width={labelSkeletonWidth} />}
          value=""
          disabled
        />
      );
    }

    if (loading) {
      return (
        <MuiTextField
          {...{ size, variant, multiline, rows, fullWidth }}
          label={<Skeleton width={labelSkeletonWidth} />}
          value=""
          disabled
        />
      );
    }

    return (
      <MuiTextField
        ref={ref}
        {...{
          size,
          label,
          variant,
          required,
          multiline,
          rows,
          fullWidth,
          name,
        }}
        {...rest}
        value={
          value ??
          (() => {
            if (values && name && values[name] != null) {
              return values[name];
            }
            return '';
          })()
        }
        onChange={onChange ?? handleChange}
        onBlur={onBlur ?? handleBlur}
        error={
          error ??
          (() => {
            if (errors && touched && name && touched[name]) {
              return Boolean(errors[name]);
            }
          })()
        }
        helperText={
          helperText ??
          (() => {
            if (errors && touched && name && touched[name]) {
              return errors[name];
            }
          })()
        }
      />
    );
  }
);

export default TextField;
