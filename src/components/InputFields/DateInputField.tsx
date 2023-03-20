import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { format } from 'date-fns';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';

import { useLoadingContext } from '../../contexts/LoadingContext';
import FieldValueDisplay from '../FieldValueDisplay';
import TextField, { TextFieldProps } from './TextField';

export interface DateInputFieldProps extends TextFieldProps {
  value?: string;
  minDate?: string;
  maxDate?: string;
  enableTimeSelector?: boolean;
  displayFormat?: string;
}

export const DateInputField = forwardRef<HTMLDivElement, DateInputFieldProps>(
  function DateInputField(
    {
      value,
      id,
      name,
      label,
      placeholder,
      onChange,
      minDate: minDateProp,
      maxDate: maxDateProp,
      showClearButton = true,
      enableTimeSelector = false,
      displayFormat = '',
      disabled,
      sx,
      enableLoadingState = true,
      ...rest
    },
    ref
  ) {
    if (!displayFormat) {
      if (enableTimeSelector) {
        displayFormat = 'MMM dd, yyyy hh:mm aa';
      } else {
        displayFormat = 'MMM dd, yyyy';
      }
    }
    const { breakpoints } = useTheme();
    const smallScreen = useMediaQuery(breakpoints.down('sm'));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [open, setOpen] = useState(false);
    const { locked } = useLoadingContext();

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
      const minDate = minDateProp ? new Date(minDateProp) : null;
      const maxDate = maxDateProp ? new Date(maxDateProp) : null;
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
              return format(new Date(value), displayFormat);
            }
          })()}
        />
      );
    }

    const datePickerProps: DatePickerProps<any, any> = {
      open,
      onClose: () => setOpen(false),
      value: selectedDate,
      onChange: (selectedDateInstance: any) => {
        const date = selectedDateInstance as Date;
        const selectedDate =
          date && (!minDate || date >= minDate) && (!maxDate || date <= maxDate)
            ? date
            : null;
        setSelectedDate(selectedDate);
        triggerChangeEvent(
          (() => {
            if (selectedDate) {
              if (enableTimeSelector) {
                return selectedDate.toISOString();
              }
              return format(selectedDate, 'yyyy-MM-dd');
            }
            return '';
          })()
        );
      },
      renderInput: ({ value, ...params }) => {
        if (params.inputProps) {
          if (selectedDate) {
            params.inputProps.value = format(selectedDate, displayFormat);
          } else {
            params.inputProps.value = '';
          }
          placeholder && (params.inputProps.placeholder = placeholder);
          delete params.inputProps.onFocus;
          delete params.inputProps.onChange;
          delete params.inputProps.onBlur;
          delete params.inputProps.disabled;
        }
        if (params.InputProps) {
          delete params.InputProps.endAdornment;
          const selectDateIconButton = (
            <IconButton
              {...{ disabled }}
              onClick={() => setOpen(true)}
              sx={{ p: 0.4, ml: -0.5 }}
            >
              <EventIcon />
            </IconButton>
          );
          params.InputProps.startAdornment = disabled ? (
            selectDateIconButton
          ) : (
            <Tooltip title="Choose a date">{selectDateIconButton}</Tooltip>
          );
          if (showClearButton && selectedDate && !disabled) {
            params.InputProps.endAdornment = (
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
        }
        delete params.error;
        return (
          <TextField
            {...{ value: value as string }}
            {...params}
            {...rest}
            {...{ id, name, disabled }}
            onClick={() => {
              setOpen(true);
            }}
            ref={ref}
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
        );
      },
      minDate: (() => {
        if (minDateProp) {
          return new Date(minDateProp);
        }
      })(),
      maxDate: (() => {
        if (maxDateProp) {
          return new Date(maxDateProp);
        }
      })(),
    };

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {(() => {
          if (enableTimeSelector) {
            if (smallScreen) {
              return <MobileDateTimePicker {...(datePickerProps as any)} />;
            }
            return <DesktopDateTimePicker {...(datePickerProps as any)} />;
          } else {
            if (smallScreen) {
              return <MobileDatePicker {...datePickerProps} />;
            }
            return <DesktopDatePicker {...datePickerProps} />;
          }
        })()}
      </LocalizationProvider>
    );
  }
);

export default DateInputField;
