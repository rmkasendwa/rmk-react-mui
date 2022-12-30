import { addThousandCommas } from '@infinite-debugger/rmk-utils/numbers';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import TextField, { TextFieldProps } from './TextField';

export interface NumberInputFieldProps extends Omit<TextFieldProps, 'value'> {
  value?: number;
  step?: number;
  decimalPlaces?: number;
  min?: number;
  max?: number;
  valuePrefix?: string;
  valueSuffix?: string;
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
  NumberInputFieldProps
>(function NumberInputField(
  {
    step = 1,
    value,
    name,
    id,
    disabled,
    decimalPlaces,
    onBlur,
    onFocus,
    onChange: onChangeProp,
    min,
    max,
    valuePrefix = '',
    valueSuffix = '',
    endAdornment,
    sx,
    ...rest
  },
  ref
) {
  const initialRenderRef = useRef(true);
  const [inputField, setInputField] = useState<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);

  const extractNumericValue = useCallback(
    (inputValue: string) => {
      return inputValue.replace(
        new RegExp(`^${valuePrefix}|,|${valueSuffix}$`, 'g'),
        ''
      );
    },
    [valuePrefix, valueSuffix]
  );

  const getNumericInputValue = useCallback(() => {
    if (inputValue.length > 0) {
      return +extractNumericValue(inputValue);
    }
    return 0;
  }, [extractNumericValue, inputValue]);

  const stepUpInputValue = useCallback(
    (scaleFactor = 1) => {
      let numericValue = getNumericInputValue() + step * scaleFactor;
      if (max != null && numericValue > max) numericValue = max;
      setInputValue(addThousandCommas(numericValue, decimalPlaces));
    },
    [decimalPlaces, getNumericInputValue, max, step]
  );

  const stepDownInputValue = useCallback(
    (scaleFactor = 1) => {
      let numericValue = getNumericInputValue() - step * scaleFactor;
      if (min != null && numericValue < min) numericValue = min;
      setInputValue(addThousandCommas(numericValue, decimalPlaces));
    },
    [decimalPlaces, getNumericInputValue, min, step]
  );

  const triggerChangeEvent = useCallback(() => {
    const numericValue = +extractNumericValue(inputValue);
    const event: any = new Event('change', { bubbles: true });
    Object.defineProperty(event, 'target', {
      writable: false,
      value: {
        name,
        id,
        value: isNaN(numericValue) ? 0 : numericValue,
      },
    });
    onChangeProp && onChangeProp(event);
  }, [extractNumericValue, id, inputValue, name, onChangeProp]);

  const onChange = useCallback(
    ({ target }: any) => {
      const numericCharacters = findNumericCharacters(target.value);
      const numericString = (() => {
        if (numericCharacters.length > 0 && !isNaN(+numericCharacters)) {
          let numericValue = +numericCharacters;

          if (min != null && numericValue < min) numericValue = min;
          if (max != null && numericValue > max) numericValue = max;

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
    },
    [max, min]
  );

  useEffect(() => {
    if (!focused) {
      if (value !== undefined) {
        if (value != null && typeof value === 'number') {
          let numericValue = value;

          if (min != null && numericValue < min) numericValue = min;
          if (max != null && numericValue > max) numericValue = max;

          setInputValue(addThousandCommas(numericValue, decimalPlaces));
        } else {
          setInputValue('');
        }
      } else {
        setInputValue((prevInputValue) => {
          if (prevInputValue.length > 0) {
            const numericValue = +extractNumericValue(prevInputValue);
            return addThousandCommas(
              isNaN(numericValue) ? 0 : numericValue,
              decimalPlaces
            );
          }
          return prevInputValue;
        });
      }
    }
  }, [decimalPlaces, extractNumericValue, focused, max, min, value]);

  useEffect(() => {
    setInputValue((prevInputValue) => {
      if (prevInputValue.length > 0) {
        if (focused) {
          return prevInputValue.replace(
            new RegExp(`^${valuePrefix}|${valueSuffix}$`, 'g'),
            ''
          );
        } else {
          return (
            valuePrefix +
            `${prevInputValue.replace(
              new RegExp(`^${valuePrefix}|${valueSuffix}$`, 'g'),
              ''
            )}` +
            valueSuffix
          );
        }
      }
      return prevInputValue;
    });
  }, [focused, valuePrefix, valueSuffix]);

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
        event.preventDefault();
        const scaleFactor = getScaleFactor(event);
        const delta = event.wheelDelta ?? -event.detail;
        if (delta < 0) {
          stepDownInputValue(scaleFactor);
        } else {
          stepUpInputValue(scaleFactor);
        }
      };

      window.addEventListener('keydown', keydownEventCallback);
      window.addEventListener('mousewheel', mouseWheelEventCallback, {
        passive: false,
      });
      return () => {
        window.removeEventListener('keydown', keydownEventCallback);
        window.removeEventListener('mousewheel', mouseWheelEventCallback);
      };
    }
  }, [focused, stepDownInputValue, stepUpInputValue]);

  useEffect(() => {
    if (!initialRenderRef.current) {
      triggerChangeEvent();
    }
  }, [triggerChangeEvent]);

  useEffect(() => {
    initialRenderRef.current = false;
    return () => {
      initialRenderRef.current = true;
    };
  }, []);

  return (
    <TextField
      ref={ref}
      {...rest}
      {...{ name, id, onChange, disabled }}
      value={inputValue}
      onFocus={(event) => {
        setFocused(true);
        onFocus && onFocus(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur && onBlur(event);
      }}
      inputProps={{
        ref: (inputField: HTMLInputElement | null) => {
          setInputField(inputField);
        },
      }}
      endAdornment={
        !disabled ? (
          <>
            <Stack className="number-input-field-step-tools">
              <IconButton
                onClick={(event) => {
                  inputField?.focus();
                  stepUpInputValue(getScaleFactor(event));
                }}
                sx={{ width: 10, height: 10, p: 1 }}
              >
                <ArrowDropUpIcon />
              </IconButton>
              <IconButton
                onClick={(event) => {
                  inputField?.focus();
                  stepDownInputValue(getScaleFactor(event));
                }}
                sx={{ width: 10, height: 10, p: 1 }}
              >
                <ArrowDropDownIcon />
              </IconButton>
            </Stack>
            {endAdornment}
          </>
        ) : null
      }
      sx={{
        '& .number-input-field-step-tools': {
          visibility: 'hidden',
        },
        '&:hover .number-input-field-step-tools': {
          visibility: 'visible',
        },
        ...sx,
      }}
    />
  );
});

export default NumberInputField;
