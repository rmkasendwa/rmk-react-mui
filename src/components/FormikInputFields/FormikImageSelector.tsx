import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Utils';
import ImageSelector, { IImageSelectorProps } from '../ImageSelector';

export interface IFormikImageSelectorProps extends IImageSelectorProps {}

export const FormikImageSelector = forwardRef<
  HTMLDivElement,
  IFormikImageSelectorProps
>(function FormikImageSelector(
  {
    name,
    value: valueProp,
    onChange: onChangeProp,
    error: errorProp,
    helperText: helperTextProp,
    ...rest
  },
  ref
) {
  const { value, onChange, error, helperText } = useAggregatedFormikContext({
    value: valueProp,
    name,
    error: errorProp,
    helperText: helperTextProp,
    onChange: onChangeProp,
  });

  return (
    <ImageSelector
      ref={ref}
      {...rest}
      {...{ name, value, onChange, error, helperText }}
    />
  );
});

export default FormikImageSelector;
