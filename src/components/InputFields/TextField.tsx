import {
  TextField as MuiTextField,
  Skeleton,
  TextFieldProps,
} from '@mui/material';
import { forwardRef } from 'react';

import { useLoadingContext } from '../../hooks/Utils';
import ErrorSkeleton from '../ErrorSkeleton';

export interface ITextFieldProps
  extends Omit<TextFieldProps, 'variant'>,
    Pick<TextFieldProps, 'variant'> {}

export const TextField = forwardRef<HTMLDivElement, ITextFieldProps>(
  function TextField(
    { label, variant, size, multiline, rows, fullWidth, ...rest },
    ref
  ) {
    const { loading, errorMessage } = useLoadingContext();

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
          multiline,
          rows,
          fullWidth,
        }}
        {...rest}
      />
    );
  }
);

export default TextField;
