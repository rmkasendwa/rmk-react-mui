import Typography from '@mui/material/Typography';
import { forwardRef, useEffect, useState } from 'react';

import { addThousandCommas } from '../../utils/numbers';
import TextField, { TextFieldProps } from './TextField';

export interface TextAreaFieldProps extends TextFieldProps {
  value?: string;
}

export const TextAreaField = forwardRef<HTMLDivElement, TextAreaFieldProps>(
  function TextAreaField({ value, onChange, inputProps, ...rest }, ref) {
    const { maxLength } = inputProps ?? {};
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
      if (value !== undefined) {
        setInputValue(value);
      }
    }, [value]);

    return (
      <TextField
        ref={ref}
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.target.value);
          onChange && onChange(event);
        }}
        {...{ inputProps }}
        {...rest}
        InputProps={{
          sx: {
            alignItems: 'flex-end',
          },
          endAdornment: (() => {
            if (inputValue.length > 0) {
              if (maxLength) {
                return (
                  <Typography variant="body2">
                    {addThousandCommas(inputValue.length)}/
                    {addThousandCommas(maxLength)}
                  </Typography>
                );
              }
              return (
                <Typography variant="body2">
                  {addThousandCommas(inputValue.length)}
                </Typography>
              );
            }
          })(),
        }}
        minRows={4}
        multiline
      />
    );
  }
);

export default TextAreaField;
