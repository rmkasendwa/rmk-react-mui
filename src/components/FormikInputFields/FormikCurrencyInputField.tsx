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
import CurrencyInputField, {
  CurrencyInputFieldProps,
} from '../InputFields/CurrencyInputField';

export interface FormikCurrencyInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikCurrencyInputFieldClassKey =
  keyof FormikCurrencyInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikCurrencyInputField: FormikCurrencyInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikCurrencyInputField: keyof FormikCurrencyInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikCurrencyInputField?: {
      defaultProps?: ComponentsProps['MuiFormikCurrencyInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikCurrencyInputField'];
      variants?: ComponentsVariants['MuiFormikCurrencyInputField'];
    };
  }
}
//#endregion

export const getFormikCurrencyInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikCurrencyInputField', slot);
};

const slots: Record<
  FormikCurrencyInputFieldClassKey,
  [FormikCurrencyInputFieldClassKey]
> = {
  root: ['root'],
};

export const formikCurrencyInputFieldClasses: FormikCurrencyInputFieldClasses =
  generateUtilityClasses(
    'MuiFormikCurrencyInputField',
    Object.keys(slots) as FormikCurrencyInputFieldClassKey[]
  );

export interface FormikCurrencyInputFieldProps
  extends CurrencyInputFieldProps {}

export const FormikCurrencyInputField = forwardRef<
  HTMLDivElement,
  FormikCurrencyInputFieldProps
>(function FormikCurrencyInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikCurrencyInputField',
  });
  const {
    className,
    name,
    value: valueProp,
    onBlur: onBlurProp,
    onChange: onChangeProp,
    error: errorProp,
    helperText: helperTextProp,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getFormikCurrencyInputFieldUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { value, onChange, onBlur, error, helperText } =
    useAggregatedFormikContext({
      value: valueProp,
      name,
      error: errorProp,
      helperText: helperTextProp,
      onBlur: onBlurProp,
      onChange: onChangeProp,
    });

  return (
    <CurrencyInputField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikCurrencyInputField;
