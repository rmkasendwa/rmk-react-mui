import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { format } from 'date-fns';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_DATE_FORMAT } from '../../constants';
import { useSmallScreen } from '../../hooks/Utils';
import TextField, { ITextFieldProps } from './TextField';

export interface IDateInputFieldProps extends ITextFieldProps {
  value?: string;
  minDate?: string;
  maxDate?: string;
}

export const DateInputField = forwardRef<HTMLDivElement, IDateInputFieldProps>(
  function DateInputField(
    {
      value,
      id,
      name,
      placeholder,
      onChange,
      minDate: minDateProp,
      maxDate: maxDateProp,
      sx,
      ...rest
    },
    ref
  ) {
    const smallScreen = useSmallScreen();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [open, setOpen] = useState(false);

    const triggerChangeEvent = useCallback(
      (inputValue) => {
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
        triggerChangeEvent(selectedDate?.toISOString() || '');
      },
      renderInput: ({ value, ...params }) => {
        if (params.inputProps) {
          if (selectedDate) {
            params.inputProps.value = format(selectedDate, DEFAULT_DATE_FORMAT);
          } else {
            params.inputProps.value = '';
          }
          placeholder && (params.inputProps.placeholder = placeholder);
          delete params.inputProps.onFocus;
          delete params.inputProps.onChange;
          delete params.inputProps.onBlur;
        }
        if (params.InputProps) {
          params.InputProps.endAdornment = (
            <>
              {selectedDate && (
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
              )}
              <Tooltip title="Choose a date">
                <IconButton onClick={() => setOpen(true)} sx={{ p: 0.4 }}>
                  <EventIcon />
                </IconButton>
              </Tooltip>
            </>
          );
        }
        delete params.error;
        return (
          <TextField
            {...{ value: value as string }}
            {...params}
            {...rest}
            {...{ id, name }}
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
        return null;
      })(),
      maxDate: (() => {
        if (maxDateProp) {
          return new Date(maxDateProp);
        }
        return null;
      })(),
    };

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {smallScreen ? (
          <MobileDatePicker {...datePickerProps} />
        ) : (
          <DesktopDatePicker {...datePickerProps} />
        )}
      </LocalizationProvider>
    );
  }
);

export default DateInputField;
