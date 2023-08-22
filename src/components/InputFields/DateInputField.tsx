import { createDateWithoutTimezoneOffset } from '@infinite-debugger/rmk-utils/dates';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import {
  Box,
  ClickAwayListener,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grow,
  Popper,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import clsx from 'clsx';
import formatDate from 'date-fns/format';
import { omit } from 'lodash';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useGlobalConfiguration } from '../../contexts/GlobalConfigurationContext';
import { useLoadingContext } from '../../contexts/LoadingContext';
import { isDescendant } from '../../utils/html';
import DatePicker, { DatePickerProps } from '../DatePicker';
import FieldValueDisplay from '../FieldValueDisplay';
import ModalPopup from '../ModalPopup';
import Tooltip from '../Tooltip';
import TextField, { TextFieldProps } from './TextField';

export interface DateInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type DateInputFieldClassKey = keyof DateInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiDateInputField: DateInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiDateInputField: keyof DateInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiDateInputField?: {
      defaultProps?: ComponentsProps['MuiDateInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiDateInputField'];
      variants?: ComponentsVariants['MuiDateInputField'];
    };
  }
}
//#endregion

export const getDateInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiDateInputField', slot);
};

const slots: Record<DateInputFieldClassKey, [DateInputFieldClassKey]> = {
  root: ['root'],
};

export const dateInputFieldClasses: DateInputFieldClasses =
  generateUtilityClasses(
    'MuiDateInputField',
    Object.keys(slots) as DateInputFieldClassKey[]
  );

export interface DateInputFieldProps extends TextFieldProps {
  value?: string;
  minDate?: string;
  maxDate?: string;
  enableTimeSelector?: boolean;
  displayFormat?: string;
  DatePickerProps?: Partial<
    Omit<
      DatePickerProps,
      | 'onChange'
      | 'selected'
      | 'minDate'
      | 'maxDate'
      | 'showTimeSelect'
      | 'showTimeInput'
    >
  >;
}

export const DateInputField = forwardRef<HTMLDivElement, DateInputFieldProps>(
  function DateInputField(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiDateInputField' });
    const {
      className,
      value,
      id,
      name,
      label,
      onChange,
      minDate: minDateProp,
      maxDate: maxDateProp,
      showClearButton = true,
      enableTimeSelector = false,
      disabled,
      sx,
      enableLoadingState = true,
      DatePickerProps = {},
      ...rest
    } = omit(props, 'displayFormat');

    let { displayFormat = '' } = props;

    const classes = composeClasses(
      slots,
      getDateInputFieldUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { ...DatePickerPropsRest } = DatePickerProps;

    const anchorRef = useRef<HTMLInputElement>(null);
    const changedRef = useRef(false);
    const poperElementWrapperRef = useRef<HTMLDivElement>(null);
    const { breakpoints } = useTheme();
    const isSmallScreenSize = useMediaQuery(breakpoints.down('sm'));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [open, setOpen] = useState(false);
    const { locked } = useLoadingContext();

    const {
      dateFormat: globalDateFormat,
      dateTimeFormat: globalDateTimeFormat,
    } = useGlobalConfiguration();

    if (!displayFormat) {
      if (enableTimeSelector) {
        displayFormat = globalDateTimeFormat;
      } else {
        displayFormat = globalDateFormat;
      }
    }

    const triggerChangeEvent = useCallback(
      (inputValue: any) => {
        const event: any = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', {
          writable: false,
          value: {
            id,
            name,
            value: inputValue,
          },
        });
        onChange && onChange(event);
      },
      [id, name, onChange]
    );

    const { minDate, maxDate } = useMemo(() => {
      const minDate = minDateProp
        ? createDateWithoutTimezoneOffset(minDateProp)
        : null;
      const maxDate = maxDateProp
        ? createDateWithoutTimezoneOffset(maxDateProp)
        : null;
      if (minDate) {
        minDate.setHours(0, 0, 0, 0);
      }
      if (maxDate) {
        maxDate.setHours(0, 0, 0, 0);
      }
      return { minDate, maxDate };
    }, [maxDateProp, minDateProp]);

    useEffect(() => {
      setSelectedDate(value ? new Date(value) : null);
    }, [value]);

    if (enableLoadingState && locked) {
      return (
        <FieldValueDisplay
          {...({} as any)}
          {...rest.FieldValueDisplayProps}
          {...{ label }}
          value={(() => {
            if (value) {
              return formatDate(
                createDateWithoutTimezoneOffset(value),
                displayFormat
              );
            }
          })()}
        />
      );
    }

    const selectDateIconButton = (
      <IconButton
        {...{ disabled }}
        onClick={() => setOpen(true)}
        sx={{ p: 0.4, ml: -0.5 }}
      >
        <EventIcon />
      </IconButton>
    );

    return (
      <>
        <TextField
          ref={ref}
          {...rest}
          className={clsx(classes.root)}
          {...{ id, name, disabled, label, enableLoadingState }}
          value={
            selectedDate
              ? formatDate(
                  createDateWithoutTimezoneOffset(selectedDate),
                  displayFormat
                )
              : ''
          }
          InputProps={{
            startAdornment: disabled ? (
              selectDateIconButton
            ) : (
              <Tooltip title="Choose a date">{selectDateIconButton}</Tooltip>
            ),
            endAdornment: (() => {
              if (showClearButton && selectedDate && !disabled) {
                return (
                  <Tooltip title="Clear">
                    <IconButton
                      className="date-input-clear-button"
                      onClick={() => {
                        setSelectedDate(null);
                        triggerChangeEvent('');
                      }}
                      sx={{ p: 0.4 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                );
              }
            })(),
            onClick: () => {
              if (!disabled) {
                changedRef.current = false;
                setOpen(true);
              }
            },
            ref: anchorRef,
          }}
          sx={{
            '& .date-input-clear-button': {
              visibility: 'hidden',
            },
            '&:hover .date-input-clear-button': {
              visibility: 'visible',
            },
            ...sx,
          }}
        />
        {(() => {
          const datePickerElement = (
            <DatePicker
              {...DatePickerPropsRest}
              selected={selectedDate}
              onChange={(date) => {
                if (date) {
                  const selectedDate =
                    date &&
                    (!minDate || date >= minDate) &&
                    (!maxDate || date <= maxDate)
                      ? date
                      : null;
                  setSelectedDate(selectedDate);
                  triggerChangeEvent(
                    (() => {
                      if (selectedDate) {
                        if (enableTimeSelector) {
                          return selectedDate.toISOString();
                        }
                        return formatDate(selectedDate, 'yyyy-MM-dd');
                      }
                      return '';
                    })()
                  );
                } else {
                  setSelectedDate(null);
                }
                changedRef.current = true;
                setOpen(false);
              }}
              minDate={minDate}
              maxDate={maxDate}
              showTimeSelect={enableTimeSelector}
              showTimeInput={enableTimeSelector}
            />
          );
          if (isSmallScreenSize) {
            return (
              <ModalPopup
                {...{ open }}
                onClose={() => {
                  setOpen(false);
                }}
                CardProps={{
                  sx: {
                    maxHeight: 'none',
                  },
                }}
                CardBodyProps={{
                  sx: {
                    p: 0,
                  },
                }}
                disableEscapeKeyDown={false}
                disableAutoFocus={false}
                showHeaderToolbar={false}
                enableCloseOnBackdropClick
                sx={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {datePickerElement}
              </ModalPopup>
            );
          }
          return (
            <Popper
              {...{ open }}
              anchorEl={anchorRef.current}
              transition
              placement="bottom-start"
              sx={{
                zIndex: 9999,
              }}
            >
              {({ TransitionProps }) => {
                return (
                  <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: '0 0 0' }}
                  >
                    <Box ref={poperElementWrapperRef}>
                      <ClickAwayListener
                        onClickAway={(event) => {
                          if (
                            poperElementWrapperRef.current &&
                            changedRef.current === false
                          ) {
                            setOpen(
                              isDescendant(
                                poperElementWrapperRef.current,
                                event.target as any
                              )
                            );
                          }
                        }}
                      >
                        {datePickerElement}
                      </ClickAwayListener>
                    </Box>
                  </Grow>
                );
              }}
            </Popper>
          );
        })()}
      </>
    );
  }
);

export default DateInputField;
