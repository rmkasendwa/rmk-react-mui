import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  BoxProps,
  generateUtilityClass,
  generateUtilityClasses,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import MuiTextField, {
  TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { ReactNode, forwardRef, useCallback, useEffect, useState } from 'react';

import { useLoadingContext } from '../../contexts/LoadingContext';
import ErrorSkeleton from '../ErrorSkeleton';
import FieldValueDisplay, {
  FieldValueDisplayProps,
} from '../FieldValueDisplay';

export interface TextFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TextFieldClassKey = keyof TextFieldClasses;

export function getTextFieldUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTextField', slot);
}

export const textFieldClasses: TextFieldClasses = generateUtilityClasses(
  'MuiTextField',
  ['root']
);

export interface TextFieldProps
  extends Omit<MuiTextFieldProps, 'variant'>,
    Pick<MuiTextFieldProps, 'variant'> {
  labelWrapped?: boolean;
  labelWrappedPlaceholderFallback?: boolean;
  FieldValueDisplayProps?: Partial<FieldValueDisplayProps>;
  value?: string;
  endAdornment?: ReactNode;
  endChildren?: ReactNode;
  WrapperProps?: Partial<BoxProps>;
  showClearButton?: boolean;
  enableLoadingState?: boolean;
}

export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  function TextField(
    {
      label,
      placeholder,
      variant,
      size,
      multiline,
      rows,
      fullWidth,
      name,
      id,
      onChange,
      disabled,
      value,
      required,
      labelWrapped = false,
      endAdornment: endAdornmentProp,
      enableLoadingState = true,
      endChildren,
      WrapperProps = {},
      showClearButton = true,
      labelWrappedPlaceholderFallback = false,
      FieldValueDisplayProps = {},
      sx,
      ...rest
    },
    ref
  ) {
    const { sx: WrapperPropsSx, ...WrapperPropsRest } = WrapperProps;
    const { ...FieldValueDisplayPropsRest } = FieldValueDisplayProps;

    const { InputProps = {} } = rest;
    const { endAdornment, ...restInputProps } = InputProps;

    const { loading, errorMessage, locked } = useLoadingContext();
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

    if (locked) {
      return (
        <FieldValueDisplay
          {...FieldValueDisplayPropsRest}
          {...{ label, value }}
        />
      );
    }

    const labelSkeletonWidth = typeof label === 'string' ? label.length * 7 : 0;

    const textField = (() => {
      if (enableLoadingState) {
        if (errorMessage) {
          return (
            <MuiTextField
              {...{ size, variant, multiline, rows, fullWidth, sx }}
              label={<ErrorSkeleton width={labelSkeletonWidth} />}
              value=""
              disabled
            />
          );
        }

        if (loading) {
          return (
            <MuiTextField
              {...{ size, variant, multiline, rows, fullWidth, sx }}
              label={<Skeleton width={labelSkeletonWidth} />}
              value=""
              disabled
              InputProps={{
                endAdornment: <CircularProgress size={18} color="inherit" />,
              }}
            />
          );
        }
      }

      return (
        <Box
          {...WrapperPropsRest}
          sx={{
            position: 'relative',
            ...(() => {
              if (fullWidth) {
                return {
                  width: '100%',
                };
              }
            })(),
            ...WrapperPropsSx,
          }}
        >
          <MuiTextField
            ref={ref}
            {...{
              size,
              variant,
              multiline,
              rows,
              fullWidth,
              id,
              name,
              disabled,
              required,
            }}
            {...rest}
            label={(() => {
              if (!labelWrapped) {
                return label;
              }
            })()}
            placeholder={(() => {
              if (
                labelWrapped &&
                labelWrappedPlaceholderFallback &&
                !placeholder &&
                typeof label === 'string'
              ) {
                return label;
              }
              return placeholder;
            })()}
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
                        {showClearButton &&
                        inputValue.length > 0 &&
                        !disabled ? (
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
          {endChildren}
        </Box>
      );
    })();

    if (labelWrapped && label) {
      return (
        <FieldValueDisplay
          {...FieldValueDisplayPropsRest}
          {...{ label, required }}
          value={textField}
        />
      );
    }

    return textField;
  }
);

export default TextField;
