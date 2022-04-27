import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { IconButton, Stack } from '@mui/material';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import { addThousandCommas } from '../../utils/numbers';
import TextField, { ITextFieldProps } from './TextField';

export interface INumberInputFieldProps extends ITextFieldProps {
  value?: number;
  step?: number;
}

const findNumericCharacters = (number: string) => {
  number = cleanDemicalPoint(number);
  return number.replace(/[^\d\-\.]/g, '');
};

const cleanDemicalPoint = (number: string): string => {
  const numberOfDecimalPoints = number.match(/\./g);
  if (numberOfDecimalPoints && numberOfDecimalPoints.length > 1) {
    return number.substring(0, number.lastIndexOf('.'));
  }
  return number;
};

const getScaleFactor = (event: any) => {
  if (event.altKey) {
    return 0.1;
  }
  if (event.shiftKey) {
    return 10;
  }
  if (event.ctrlKey) {
    return 100;
  }
  return 1;
};

export const NumberInputField = forwardRef<
  HTMLDivElement,
  INumberInputFieldProps
>(function NumberInputField(
  { step = 1, value, name, id, onChange, ...rest },
  ref
) {
  const [, setInputField] = useState<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);

  const getNumericInputValue = useCallback(() => {
    if (inputValue.length > 0) {
      return +inputValue.replace(/,/g, '');
    }
    return 0;
  }, [inputValue]);

  const stepUpInputValue = useCallback(
    (scaleFactor = 1) => {
      setInputValue(
        addThousandCommas(getNumericInputValue() + step * scaleFactor)
      );
    },
    [getNumericInputValue, step]
  );

  const stepDownInputValue = useCallback(
    (scaleFactor = 1) => {
      setInputValue(
        addThousandCommas(getNumericInputValue() - step * scaleFactor)
      );
    },
    [getNumericInputValue, step]
  );

  useEffect(() => {
    if (!focused) {
      if (value != null) {
        setInputValue(addThousandCommas(value));
      } else {
        setInputValue('');
      }
    }
  }, [focused, value]);

  useEffect(() => {
    if (focused) {
      const numericValue = +inputValue.replace(/,/g, '');
      const event: any = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: {
          name,
          id,
          value: isNaN(numericValue) ? 0 : numericValue,
        },
      });
      onChange && onChange(event);
    }
  }, [focused, id, inputValue, name, onChange]);

  useEffect(() => {
    if (focused) {
      const keydownEventCallback = (event: KeyboardEvent) => {
        const scaleFactor = getScaleFactor(event);
        switch (event.key) {
          case 'ArrowUp':
          case 'ArrowRight':
            stepUpInputValue(scaleFactor);
            break;
          case 'ArrowDown':
          case 'ArrowLeft':
            stepDownInputValue(scaleFactor);
            break;
        }
      };
      const mouseWheelEventCallback = (event: any) => {
        const scaleFactor = getScaleFactor(event);
        const delta = event.wheelDelta ?? -event.detail;
        if (delta < 0) {
          stepDownInputValue(scaleFactor);
        } else {
          stepUpInputValue(scaleFactor);
        }
      };

      window.addEventListener('keydown', keydownEventCallback);
      window.addEventListener('mousewheel', mouseWheelEventCallback);
      return () => {
        window.removeEventListener('keydown', keydownEventCallback);
        window.removeEventListener('mousewheel', mouseWheelEventCallback);
      };
    }
  }, [focused, stepDownInputValue, stepUpInputValue]);

  return (
    <TextField
      ref={(inputField) => {
        setInputField(inputField);
        typeof ref === 'function' && ref(inputField);
      }}
      {...rest}
      {...{ name, id }}
      value={inputValue}
      onChange={({ target }) => {
        const numericCharacters = findNumericCharacters(target.value);
        const numericString = (() => {
          if (numericCharacters.length > 0 && !isNaN(+numericCharacters)) {
            const numericValue = +numericCharacters;
            const numericValueWithThousandCommas =
              addThousandCommas(numericValue);
            if (numericCharacters.endsWith('.')) {
              return numericValueWithThousandCommas + '.';
            }
            const match = /\d+(\.\d*0+)$/g.exec(numericCharacters);
            if (match) {
              return numericValueWithThousandCommas.split('.')[0] + match[1];
            }
            return numericValueWithThousandCommas;
          }
          return numericCharacters;
        })();
        setInputValue(numericString.replace(/^\-+/g, '-'));
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      InputProps={{
        endAdornment: (
          <Stack>
            <IconButton
              onClick={(event) => {
                stepUpInputValue(getScaleFactor(event));
              }}
              sx={{ width: 10, height: 10, p: 1 }}
            >
              <ArrowDropUpIcon />
            </IconButton>
            <IconButton
              onClick={(event) => {
                stepDownInputValue(getScaleFactor(event));
              }}
              sx={{ width: 10, height: 10, p: 1 }}
            >
              <ArrowDropDownIcon />
            </IconButton>
          </Stack>
        ),
      }}
    />
  );
});

export default NumberInputField;
