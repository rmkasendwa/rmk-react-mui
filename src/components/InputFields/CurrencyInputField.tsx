import { InputProps, Typography } from '@mui/material';
import { FC } from 'react';

import NumberInputField, { INumberInputFieldProps } from './NumberInputField';

interface ICurrencyInputFieldProps extends INumberInputFieldProps {
  showCurrency?: boolean;
}

export const CurrencyInputField: FC<ICurrencyInputFieldProps> = ({
  showCurrency = false,
  InputProps,
  ...rest
}) => {
  const inputProps: InputProps = {};
  showCurrency &&
    (inputProps.endAdornment = <Typography variant="body2">UGX</Typography>);
  return (
    <NumberInputField {...rest} InputProps={{ ...inputProps, ...InputProps }} />
  );
};

export default CurrencyInputField;
