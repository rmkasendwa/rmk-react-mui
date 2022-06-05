import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Tooltip } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import MuiTextField, { TextFieldProps } from '@mui/material/TextField';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import { useLoadingContext } from '../../hooks/Utils';
import ErrorSkeleton from '../ErrorSkeleton';

export interface ITextFieldProps
  extends Omit<TextFieldProps, 'variant'>,
    Pick<TextFieldProps, 'variant'> {
  value?: string;
}

export const TextField = forwardRef<HTMLDivElement, ITextFieldProps>(
  function TextField(
    {
      label,
      variant,
      size,
      multiline,
      rows,
      fullWidth,
      name,
      id,
      onChange,
      value,
      sx,
      ...rest
    },
    ref
  ) {
    const { InputProps = {} } = rest;
    const { endAdornment, ...restInputProps } = InputProps;
    const { loading, errorMessage } = useLoadingContext();
    const [inputValue, setInputValue] = useState('');

    const triggerChangeEvent = useCallback(() => {
      const event: any = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: {
          name,
          id,
          value: inputValue,
        },
      });
      onChange && onChange(event);
    }, [id, inputValue, name, onChange]);

    useEffect(() => {
      setInputValue(value || '');
    }, [value]);

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
          id,
          name,
        }}
        {...rest}
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.target.value);
          onChange && onChange(event);
        }}
        InputProps={{
          endAdornment:
            endAdornment ??
            (inputValue.length > 0 ? (
              <Tooltip title="Clear">
                <IconButton
                  className="text-input-clear-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setInputValue('');
                    triggerChangeEvent();
                  }}
                  sx={{ p: 0.4 }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            ) : null),
          ...restInputProps,
        }}
        sx={{
          '& .text-input-clear-button': {
            opacity: 0,
          },
          '&:hover .text-input-clear-button': {
            opacity: 1,
          },
          ...sx,
        }}
      />
    );
  }
);

export default TextField;
