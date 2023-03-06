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
import CreditCardExpiryDateInputField, {
  CreditCardExpiryDateInputFieldProps,
} from '../InputFields/CreditCardExpiryDateInputField';

export interface FormikCreditCardExpiryDateInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikCreditCardExpiryDateInputFieldClassKey =
  keyof FormikCreditCardExpiryDateInputFieldClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikCreditCardExpiryDateInputField: FormikCreditCardExpiryDateInputFieldProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikCreditCardExpiryDateInputField: keyof FormikCreditCardExpiryDateInputFieldClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikCreditCardExpiryDateInputField?: {
      defaultProps?: ComponentsProps['MuiFormikCreditCardExpiryDateInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikCreditCardExpiryDateInputField'];
      variants?: ComponentsVariants['MuiFormikCreditCardExpiryDateInputField'];
    };
  }
}

export interface FormikCreditCardExpiryDateInputFieldProps
  extends CreditCardExpiryDateInputFieldProps {}

export function getFormikCreditCardExpiryDateInputFieldUtilityClass(
  slot: string
): string {
  return generateUtilityClass('MuiFormikCreditCardExpiryDateInputField', slot);
}

export const formikCreditCardExpiryDateInputFieldClasses: FormikCreditCardExpiryDateInputFieldClasses =
  generateUtilityClasses('MuiFormikCreditCardExpiryDateInputField', ['root']);

const slots = {
  root: ['root'],
};

export const FormikCreditCardExpiryDateInputField = forwardRef<
  HTMLDivElement,
  FormikCreditCardExpiryDateInputFieldProps
>(function FormikCreditCardExpiryDateInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikCreditCardExpiryDateInputField',
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
    getFormikCreditCardExpiryDateInputFieldUtilityClass,
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
    <CreditCardExpiryDateInputField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikCreditCardExpiryDateInputField;
