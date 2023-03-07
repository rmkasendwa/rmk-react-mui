import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  BoxProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import MuiTextField, {
  TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import {
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

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

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTextFieldExtended: TextFieldProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTextFieldExtended: keyof TextFieldClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTextFieldExtended?: {
      defaultProps?: ComponentsProps['MuiTextFieldExtended'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTextFieldExtended'];
      variants?: ComponentsVariants['MuiTextFieldExtended'];
    };
  }
}

export interface TextFieldProps
  extends Omit<MuiTextFieldProps, 'variant'>,
    Pick<MuiTextFieldProps, 'variant'> {
  labelWrapped?: boolean;
  labelWrappedPlaceholderFallback?: boolean;
  FieldValueDisplayProps?: Partial<FieldValueDisplayProps>;
  value?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  endChildren?: ReactNode;
  WrapperProps?: Partial<BoxProps>;
  showClearButton?: boolean;
  enableLoadingState?: boolean;
}

export function getTextFieldUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTextFieldExtended', slot);
}

export const textFieldClasses: TextFieldClasses = generateUtilityClasses(
  'MuiTextFieldExtended',
  ['root']
);

const slots = {
  root: ['root'],
};

export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  function TextField(inProps, ref) {
    const props = useThemeProps({
      props: inProps,
      name: 'MuiTextFieldExtended',
    });
    const {
      className,
      label,
      placeholder,
      variant,
      size,
      multiline,
      minRows,
      rows,
      fullWidth,
      name,
      id,
      onChange,
      disabled,
      value,
      required,
      labelWrapped = false,
      startAdornment,
      endAdornment: endAdornmentProp,
      enableLoadingState = true,
      endChildren,
      WrapperProps = {},
      showClearButton = true,
      labelWrappedPlaceholderFallback = false,
      FieldValueDisplayProps = {},
      sx,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getTextFieldUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { sx: WrapperPropsSx, ...WrapperPropsRest } = WrapperProps;
    const { ...FieldValueDisplayPropsRest } = FieldValueDisplayProps;

    const { InputProps = {} } = rest;
    const { endAdornment, ...restInputProps } = InputProps;

    // Refs
    const onChangeRef = useRef(onChange);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    const triggerChangeEvent = useCallback(
      (inputValue: string) => {
        if (onChangeRef.current) {
          const event: any = new Event('change', { bubbles: true });
          Object.defineProperty(event, 'target', {
            writable: false,
            value: {
              name,
              id,
              value: inputValue,
            },
          });
          onChangeRef.current(event);
        }
      },
      [id, name]
    );

    const { loading, errorMessage, locked } = useLoadingContext();
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
      if (onChangeRef.current && value != null) {
        setInputValue(value);
      }
    }, [value]);

    if (enableLoadingState && locked) {
      return (
        <FieldValueDisplay
          {...({} as any)}
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
              ref={ref}
              className={clsx(classes.root)}
              {...{ size, variant, multiline, minRows, rows, fullWidth, sx }}
              label={<ErrorSkeleton width={labelSkeletonWidth} />}
              value=""
              disabled
            />
          );
        }

        if (loading) {
          return (
            <MuiTextField
              ref={ref}
              className={clsx(classes.root)}
              {...{ size, variant, multiline, minRows, rows, fullWidth, sx }}
              label={<Skeleton width={labelSkeletonWidth} />}
              value=""
              disabled
              InputProps={{
                endAdornment: (
                  <Box>
                    <CircularProgress size={18} color="inherit" />
                  </Box>
                ),
                sx: {
                  ...(() => {
                    if (multiline && (minRows || rows)) {
                      return { alignItems: 'start' };
                    }
                    return { alignItems: 'center' };
                  })(),
                },
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
            className={clsx(classes.root)}
            {...{
              size,
              variant,
              multiline,
              minRows,
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
              if (!onChangeRef.current || value == null) {
                setInputValue(event.target.value);
              }
              triggerChangeEvent(event.target.value);
            }}
            InputProps={{
              startAdornment,
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
                                event.preventDefault();
                                if (!onChangeRef.current || value == null) {
                                  setInputValue('');
                                }
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
          {...({} as any)}
          {...{ label, required }}
          value={textField}
        />
      );
    }

    return textField;
  }
);

export default TextField;
