import { Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';

import { addThousandCommas } from '../../utils/numbers';
import TextField, { ITextFieldProps } from './TextField';

export interface ITextAreaFieldProps extends ITextFieldProps {
  value?: string;
}

export const TextAreaField: FC<ITextAreaFieldProps> = ({
  value,
  onChange,
  inputProps,
  ...rest
}) => {
  const { maxLength } = inputProps ?? {};
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  return (
    <TextField
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
};

export default TextAreaField;
