import { forwardRef } from 'react';

import NumberInputField, { NumberInputFieldProps } from './NumberInputField';

export interface PercentageInputFieldProps extends NumberInputFieldProps {}

export const PercentageInputField = forwardRef<
  HTMLDivElement,
  PercentageInputFieldProps
>(function PercentageInputField({ ...rest }, ref) {
  return (
    <NumberInputField
      ref={ref}
      min={0}
      max={100}
      decimalPlaces={2}
      valueSuffix="%"
      {...rest}
    />
  );
});

export default PercentageInputField;
