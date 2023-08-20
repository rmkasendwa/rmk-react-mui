import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import ImageSelector, { ImageSelectorProps } from '../ImageSelector';

export interface FormikImageSelectorClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikImageSelectorClassKey = keyof FormikImageSelectorClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikImageSelector: FormikImageSelectorProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikImageSelector: keyof FormikImageSelectorClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikImageSelector?: {
      defaultProps?: ComponentsProps['MuiFormikImageSelector'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikImageSelector'];
      variants?: ComponentsVariants['MuiFormikImageSelector'];
    };
  }
}
//#endregion

export const getFormikImageSelectorUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikImageSelector', slot);
};

const slots: Record<
  FormikImageSelectorClassKey,
  [FormikImageSelectorClassKey]
> = {
  root: ['root'],
};

export const formikImageSelectorClasses: FormikImageSelectorClasses =
  generateUtilityClasses(
    'MuiFormikImageSelector',
    Object.keys(slots) as FormikImageSelectorClassKey[]
  );

export interface FormikImageSelectorProps extends ImageSelectorProps {}

export const FormikImageSelector = forwardRef<
  HTMLDivElement,
  FormikImageSelectorProps
>(function FormikImageSelector(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikImageSelector',
  });
  const {
    className,
    name,
    value: valueProp,
    onChange: onChangeProp,
    error: errorProp,
    helperText: helperTextProp,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getFormikImageSelectorUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

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
      className={clsx(classes.root)}
      {...({ name, value, onChange, error, helperText } as any)}
    />
  );
});

export default FormikImageSelector;
