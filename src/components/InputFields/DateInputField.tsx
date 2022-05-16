import 'datejs';

import {
  DatePickerProps,
  DesktopDatePicker,
  LocalizationProvider,
  MobileDatePicker,
} from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { forwardRef, useState } from 'react';

import { DEFAULT_DATE_FORMAT } from '../../constants';
import { useSmallScreen } from '../../hooks';
import TextField, { ITextFieldProps } from './TextField';

export interface IDateInputFieldProps extends ITextFieldProps {
  value?: string | number;
}

export const DateInputField = forwardRef<HTMLDivElement, IDateInputFieldProps>(
  function DateInputField({ value, name, onChange, onClick, ...rest }, ref) {
    const smallScreen = useSmallScreen();
    const [inputField, setInputField] = useState<
      HTMLInputElement | null | undefined
    >(null);

    const datePickerProps: DatePickerProps = {
      value: value ? new Date(value) : new Date(),
      onChange: (date: any) => {
        if (inputField && (!date || !isNaN(date.getTime()))) {
          inputField.value = date
            ? (() => {
                date.addMinutes(-date.getTimezoneOffset());
                return date.toISOString();
              })()
            : '';
          const event: any = new Event('change', { bubbles: true });
          Object.defineProperty(event, 'target', {
            writable: false,
            value: inputField,
          });
          onChange && onChange(event);
        }
      },
      renderInput: (params) => {
        if (params.inputProps) {
          if (value) {
            params.inputProps.value = new Date(
              params.inputProps.value
            ).toString(DEFAULT_DATE_FORMAT);
          } else {
            params.inputProps.value = '';
          }
          delete params.inputProps.onFocus;
          delete params.inputProps.onChange;
          delete params.inputProps.onBlur;
        }
        delete params.error;
        return (
          <TextField
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
          />
        );
      },
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
