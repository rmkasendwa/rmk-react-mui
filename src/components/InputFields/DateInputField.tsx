import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { DatePickerProps } from '@mui/lab/DatePicker';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { addMinutes, format } from 'date-fns';
import { forwardRef, useEffect, useState } from 'react';

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
      name,
      placeholder,
      onChange,
      onClick,
      minDate,
      maxDate,
      sx,
      ...rest
    },
    ref
  ) {
    const smallScreen = useSmallScreen();
    const [inputField, setInputField] = useState<
      HTMLInputElement | null | undefined
    >(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [open, setOpen] = useState(false);

    useEffect(() => {
      setSelectedDate(value || '');
    }, [value]);

    useEffect(() => {
      if (inputField) {
        const inputFieldClone = inputField.cloneNode() as any;
        inputFieldClone.value = selectedDate;
        const event: any = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', {
          writable: false,
          value: inputFieldClone,
        });
        onChange && onChange(event);
      }
    }, [inputField, onChange, selectedDate]);

    const datePickerProps: DatePickerProps = {
      open,
      onClose: () => setOpen(false),
      value: selectedDate ? new Date(selectedDate) : new Date(),
      onChange: (date: any) => {
        setSelectedDate(
          date ? addMinutes(date, -date.getTimezoneOffset()).toISOString() : ''
        );
      },
      renderInput: ({ value, ...params }) => {
        if (params.inputProps) {
          if (selectedDate) {
            params.inputProps.value = format(
              new Date(params.inputProps.value),
              DEFAULT_DATE_FORMAT
            );
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
                    onClick={() => setSelectedDate('')}
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
            {...{ name }}
            onClick={(event) => {
              inputField?.nextElementSibling?.querySelector('button')?.click();
              onClick && onClick(event);
            }}
            ref={(inputFieldWrapper) => {
              const inputField = inputFieldWrapper?.querySelector('input');
              setInputField(inputField);
              typeof ref === 'function' && ref(inputField || null);
            }}
            sx={{
              '& .date-input-clear-button': {
                opacity: 0,
              },
              '&:hover .date-input-clear-button': {
                opacity: 1,
              },
              ...sx,
            }}
          />
        );
      },
      minDate: (() => {
        if (minDate) {
          return new Date(minDate);
        }
        return null;
      })(),
      maxDate: (() => {
        if (maxDate) {
          return new Date(maxDate);
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
