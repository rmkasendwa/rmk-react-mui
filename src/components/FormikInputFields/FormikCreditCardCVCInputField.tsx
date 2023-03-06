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

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikCreditCardCVCInputField: FormikCreditCardCVCInputFieldProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikCreditCardCVCInputField: keyof FormikCreditCardCVCInputFieldClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikCreditCardCVCInputField?: {
      defaultProps?: ComponentsProps['MuiFormikCreditCardCVCInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikCreditCardCVCInputField'];
      variants?: ComponentsVariants['MuiFormikCreditCardCVCInputField'];
    };
  }
}

export interface FormikCreditCardCVCInputFieldProps
  extends CreditCardCVCInputFieldProps {}

export function getFormikCreditCardCVCInputFieldUtilityClass(
  slot: string
): string {
  return generateUtilityClass('MuiFormikCreditCardCVCInputField', slot);
}

export const formikCreditCardCVCInputFieldClasses: FormikCreditCardCVCInputFieldClasses =
  generateUtilityClasses('MuiFormikCreditCardCVCInputField', ['root']);

const slots = {
  root: ['root'],
};

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
