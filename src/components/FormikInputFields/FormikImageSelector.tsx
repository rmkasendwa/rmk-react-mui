import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import ImageSelector, { ImageSelectorProps } from '../ImageSelector';

export interface FormikImageSelectorProps extends ImageSelectorProps {}

export const FormikImageSelector = forwardRef<
  HTMLDivElement,
  FormikImageSelectorProps
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
      {...({ name, value, onChange, error, helperText } as any)}
    />
  );
});

export default FormikImageSelector;
