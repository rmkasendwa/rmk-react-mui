import 'datejs';

import {
  DesktopDatePicker,
  DesktopDatePickerProps,
  LocalizationProvider,
  MobileDatePicker,
  MobileDatePickerProps,
} from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { FC, useEffect, useState } from 'react';

import { DEFAULT_DATE_FORMAT } from '../../constants';
import { useFormikValue, useSmallScreen } from '../../hooks';
import TextField, { ITextFieldProps } from './TextField';

export interface IDateInputFieldProps extends ITextFieldProps {
  value?: string | number;
}

export const DateInputField: FC<IDateInputFieldProps> = ({
  value,
  name,
  onChange,
  ...rest
}) => {
  value = useFormikValue({ value, name });

  const smallScreen = useSmallScreen();
  const [inputField, setInputField] = useState<
    HTMLInputElement | null | undefined
  >(null);

  const [selectedDateString, setSelectedDateString] = useState<string | number>(
    ''
  );

  useEffect(() => {
    setSelectedDateString(value ?? '');
  }, [value]);

  const datePickerProps: MobileDatePickerProps | DesktopDatePickerProps = {
    value: selectedDateString ? new Date(selectedDateString) : new Date(),
    onChange: (date: any) => {
      if (inputField) {
        inputField.value = date ? date.toISOString() : '';
        setSelectedDateString(inputField.value);
        if (onChange) {
          const event: any = new Event('change', { bubbles: true });
          Object.defineProperty(event, 'target', {
            writable: false,
            value: inputField,
          });
          onChange(event);
        }
      }
    },
    renderInput: (params) => {
      if (params.inputProps) {
        if (selectedDateString) {
          params.inputProps.value = new Date(selectedDateString).toString(
            DEFAULT_DATE_FORMAT
          );
        } else {
          params.inputProps.value = '';
        }
      }
      return (
        <TextField
          {...params}
          {...rest}
          {...{ name }}
          ref={(inputField) => {
            setInputField(inputField?.querySelector('input'));
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
};

export default DateInputField;
