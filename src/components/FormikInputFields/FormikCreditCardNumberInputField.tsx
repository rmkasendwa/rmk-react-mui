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
import CreditCardNumberInputField, {
  CreditCardNumberInputFieldProps,
} from '../InputFields/CreditCardNumberInputField';

export interface FormikCreditCardNumberInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikCreditCardNumberInputFieldClassKey =
  keyof FormikCreditCardNumberInputFieldClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikCreditCardNumberInputField: FormikCreditCardNumberInputFieldProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikCreditCardNumberInputField: keyof FormikCreditCardNumberInputFieldClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikCreditCardNumberInputField?: {
      defaultProps?: ComponentsProps['MuiFormikCreditCardNumberInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikCreditCardNumberInputField'];
      variants?: ComponentsVariants['MuiFormikCreditCardNumberInputField'];
    };
  }
}

export interface FormikCreditCardNumberInputFieldProps
  extends CreditCardNumberInputFieldProps {}

export function getFormikCreditCardNumberInputFieldUtilityClass(
  slot: string
): string {
  return generateUtilityClass('MuiFormikCreditCardNumberInputField', slot);
}

export const formikCreditCardNumberInputFieldClasses: FormikCreditCardNumberInputFieldClasses =
  generateUtilityClasses('MuiFormikCreditCardNumberInputField', ['root']);

const slots = {
  root: ['root'],
};

export const FormikCreditCardNumberInputField = forwardRef<
  HTMLDivElement,
  FormikCreditCardNumberInputFieldProps
>(function FormikCreditCardNumberInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikCreditCardNumberInputField',
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
    getFormikCreditCardNumberInputFieldUtilityClass,
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
    <CreditCardNumberInputField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikCreditCardNumberInputField;
