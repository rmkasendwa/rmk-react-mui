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
import clsx from 'clsx';
import {
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { merge } from 'lodash';
import { useLoadingContext } from '../../contexts/LoadingContext';
import ErrorSkeleton from '../ErrorSkeleton';
import FieldValueDisplay, {
  FieldValueDisplayProps,
} from '../FieldValueDisplay';
import Tooltip from '../Tooltip';

export interface TextFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type TextFieldClassKey = keyof TextFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTextFieldExtended: TextFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTextFieldExtended: keyof TextFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTextFieldExtended?: {
      defaultProps?: ComponentsProps['MuiTextFieldExtended'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTextFieldExtended'];
      variants?: ComponentsVariants['MuiTextFieldExtended'];
    };
  }
}
//#endregion

export const getTextFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTextFieldExtended', slot);
};

const slots: Record<TextFieldClassKey, [TextFieldClassKey]> = {
  root: ['root'],
};

export const textFieldClasses: TextFieldClasses = generateUtilityClasses(
  'MuiTextFieldExtended',
  Object.keys(slots) as TextFieldClassKey[]
);

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
  showClearButton?: boolean | 'always' | 'hover';
  onClickClearButton?: () => void;
  enableLoadingState?: boolean;
}

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
      startAdornment: startAdornmentProp,
      endAdornment: endAdornmentProp,
      enableLoadingState = true,
      endChildren,
      WrapperProps = {},
      showClearButton = true,
      labelWrappedPlaceholderFallback = false,
      FieldValueDisplayProps = {},
      onClickClearButton,
      sx,
      slotProps,
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
    const [localInputValue, setLocalInputValue] = useState(value ?? '');

    const inputValue = (() => {
      if (onChangeRef.current && value != null) {
        return value;
      }
      return localInputValue;
    })();

    useEffect(() => {
      if (!onChangeRef.current && value != null) {
        setLocalInputValue(value);
      }
    }, [value]);

    if (enableLoadingState && locked) {
      return (
        <FieldValueDisplay
          {...FieldValueDisplayPropsRest}
          {...{ label, value, disabled }}
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
              slotProps={{
                input: {
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
                },
              }}
            />
          );
        }
      }

      const startAdornment = (() => {
        if (slotProps?.input && 'startAdornment' in slotProps.input) {
          return slotProps.input.startAdornment;
        }
        return startAdornmentProp;
      })();

      const endAdornment = (() => {
        if (slotProps?.input && 'endAdornment' in slotProps.input) {
          return slotProps.input.endAdornment;
        }
        return (
          <>
            {showClearButton &&
            (inputValue.length > 0 || showClearButton === 'always') &&
            !disabled ? (
              <Tooltip title="Clear" disableInteractive>
                <IconButton
                  className="text-input-clear-button"
                  tabIndex={-1}
                  onClick={(event) => {
                    event.preventDefault();
                    if (!onChangeRef.current || value == null) {
                      setLocalInputValue('');
                    }
                    triggerChangeEvent('');
                    onClickClearButton?.();
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
      })();

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
                setLocalInputValue(event.target.value);
              }
              triggerChangeEvent(event.target.value);
            }}
            slotProps={merge(
              {
                input: {
                  startAdornment,
                  endAdornment,
                },
              },
              slotProps
            )}
            sx={[
              {
                ...(() => {
                  if (showClearButton !== 'always') {
                    return {
                      '& .text-input-clear-button': {
                        display: 'none',
                      },
                      '&:hover .text-input-clear-button': {
                        display: 'inline-flex',
                      },
                    };
                  }
                })(),
              },
              ...(Array.isArray(sx) ? sx : [sx]),
            ]}
          />
          {endChildren}
        </Box>
      );
    })();

    if (labelWrapped && label) {
      return (
        <FieldValueDisplay
          {...FieldValueDisplayPropsRest}
          {...{ label, required, disabled }}
          LabelProps={{
            ...FieldValueDisplayPropsRest.LabelProps,
            ...(() => {
              if (!variant || variant === 'outlined' || variant === 'filled') {
                return {
                  slotProps: {
                    containerGrid: {
                      ...FieldValueDisplayPropsRest.LabelProps?.slotProps
                        ?.containerGrid,
                      sx: {
                        ...FieldValueDisplayPropsRest.LabelProps?.slotProps
                          ?.containerGrid?.sx,
                        mb: 0.5,
                      },
                    },
                  },
                };
              }
            })(),
          }}
          fullWidth={fullWidth}
          value={textField}
          enableLoadingState={false}
        />
      );
    }

    return textField;
  }
);

export default TextField;
