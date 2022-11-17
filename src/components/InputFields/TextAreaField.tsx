import { addThousandCommas } from '@infinite-debugger/rmk-utils/numbers';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { forwardRef, useEffect, useState } from 'react';

import TextField, { TextFieldProps } from './TextField';

export interface TextAreaFieldProps extends TextFieldProps {
  value?: string;
}

export const TextAreaField = forwardRef<HTMLDivElement, TextAreaFieldProps>(
  function TextAreaField({ value, onChange, inputProps, ...rest }, ref) {
    const { spacing } = useTheme();
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
            pb: 3,
          },
          endAdornment: (() => {
            if (inputValue.length > 0) {
              return (
                <Box
                  sx={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    right: spacing(2),
                    bottom: spacing(1),
                  }}
                >
                  {(() => {
                    if (maxLength) {
                      return (
                        <Typography component="div" variant="body2">
                          {addThousandCommas(inputValue.length)}/
                          {addThousandCommas(maxLength)}
                        </Typography>
                      );
                    }
                    return (
                      <Typography component="div" variant="body2">
                        {addThousandCommas(inputValue.length)}
                      </Typography>
                    );
                  })()}
                </Box>
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
