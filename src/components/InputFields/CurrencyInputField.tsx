import { InputProps, Typography } from '@mui/material';
import { forwardRef } from 'react';

import NumberInputField, { INumberInputFieldProps } from './NumberInputField';

export interface ICurrencyInputFieldProps extends INumberInputFieldProps {
  showCurrency?: boolean;
}

export const CurrencyInputField = forwardRef<
  HTMLDivElement,
  ICurrencyInputFieldProps
>(function CurrencyInputField(
  { showCurrency = false, InputProps, ...rest },
  ref
) {
  const inputProps: InputProps = {};
  showCurrency &&
    (inputProps.startAdornment = (
      <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold' }}>
        UGX
      </Typography>
    ));
  return (
    <NumberInputField
      ref={ref}
      step={500}
      decimalPlaces={2}
      {...rest}
      InputProps={{ ...inputProps, ...InputProps }}
    />
  );
});

export default CurrencyInputField;
