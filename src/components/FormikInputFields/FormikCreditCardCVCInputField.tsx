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
import CreditCardCVCInputField, {
  CreditCardCVCInputFieldProps,
} from '../InputFields/CreditCardCVCInputField';

export interface FormikCreditCardCVCInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikCreditCardCVCInputFieldClassKey =
  keyof FormikCreditCardCVCInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikCreditCardCVCInputField: FormikCreditCardCVCInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikCreditCardCVCInputField: keyof FormikCreditCardCVCInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikCreditCardCVCInputField?: {
      defaultProps?: ComponentsProps['MuiFormikCreditCardCVCInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikCreditCardCVCInputField'];
      variants?: ComponentsVariants['MuiFormikCreditCardCVCInputField'];
    };
  }
}
//#endregion

export const getFormikCreditCardCVCInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikCreditCardCVCInputField', slot);
};

const slots: Record<
  FormikCreditCardCVCInputFieldClassKey,
  [FormikCreditCardCVCInputFieldClassKey]
> = {
  root: ['root'],
};

export const formikCreditCardCVCInputFieldClasses: FormikCreditCardCVCInputFieldClasses =
  generateUtilityClasses(
    'MuiFormikCreditCardCVCInputField',
    Object.keys(slots) as FormikCreditCardCVCInputFieldClassKey[]
  );

export interface FormikCreditCardCVCInputFieldProps
  extends CreditCardCVCInputFieldProps {}

export const FormikCreditCardCVCInputField = forwardRef<
  HTMLDivElement,
  FormikCreditCardCVCInputFieldProps
>(function FormikCreditCardCVCInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikCreditCardCVCInputField',
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
    getFormikCreditCardCVCInputFieldUtilityClass,
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
    <CreditCardCVCInputField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikCreditCardCVCInputField;
