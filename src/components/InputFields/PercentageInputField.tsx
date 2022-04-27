import { forwardRef } from 'react';

import NumberInputField, { INumberInputFieldProps } from './NumberInputField';

export interface IPercentageInputFieldProps extends INumberInputFieldProps {}

export const PercentageInputField = forwardRef<
  HTMLDivElement,
  IPercentageInputFieldProps
>(function PercentageInputField({ ...rest }, ref) {
  return (
    <NumberInputField ref={ref} min={0} max={100} decimalPlaces={2} {...rest} />
  );
});

export default PercentageInputField;
