import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import MuiTextField, { TextFieldProps } from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { ReactNode, forwardRef, useCallback, useEffect, useState } from 'react';

import { useLoadingContext } from '../../contexts/LoadingContext';
import ErrorSkeleton from '../ErrorSkeleton';

export interface ITextFieldProps
  extends Omit<TextFieldProps, 'variant'>,
    Pick<TextFieldProps, 'variant'> {
  value?: string;
  endAdornment?: ReactNode;
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
      endAdornment: endAdornmentProp,
      sx,
      ...rest
    },
    ref
  ) {
    const { InputProps = {} } = rest;
    const { endAdornment, ...restInputProps } = InputProps;
    const { loading, errorMessage } = useLoadingContext();
    const [inputValue, setInputValue] = useState('');

    const triggerChangeEvent = useCallback(
      (inputValue: string) => {
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
      },
      [id, name, onChange]
    );

    useEffect(() => {
      setInputValue(value ?? '');
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
          InputProps={{
            endAdornment: <CircularProgress size={18} color="inherit" />,
          }}
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
          triggerChangeEvent(event.target.value);
        }}
        InputProps={{
          endAdornment:
            endAdornment ??
            (() => {
              if (inputValue.length > 0 || endAdornmentProp) {
                return (
                  <>
                    {inputValue.length > 0 ? (
                      <Tooltip title="Clear">
                        <IconButton
                          className="text-input-clear-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setInputValue('');
                            triggerChangeEvent('');
                          }}
                          sx={{ p: 0.4 }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                    {endAdornmentProp ? endAdornmentProp : null}
                  </>
                );
              }
            })(),
          ...restInputProps,
        }}
        sx={{
          '& .text-input-clear-button': {
            visibility: 'hidden',
          },
          '&:hover .text-input-clear-button': {
            visibility: 'visible',
          },
          ...sx,
        }}
      />
    );
  }
);

export default TextField;
