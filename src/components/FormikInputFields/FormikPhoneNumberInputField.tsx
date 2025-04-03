'use client';
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

import { addMethod, string } from 'yup';
import { useAggregatedFormikContext } from '../../hooks/Formik';
import { CountryCode } from '../../models/Countries';
import { isValidPhoneNumber } from '../../utils/PhoneNumberUtil';
import PhoneNumberInputField, {
  PhoneNumberInputFieldProps,
} from '../InputFields/PhoneNumberInputField';

export interface FormikPhoneNumberInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikPhoneNumberInputFieldClassKey =
  keyof FormikPhoneNumberInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikPhoneNumberInputField: FormikPhoneNumberInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikPhoneNumberInputField: keyof FormikPhoneNumberInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikPhoneNumberInputField?: {
      defaultProps?: ComponentsProps['MuiFormikPhoneNumberInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikPhoneNumberInputField'];
      variants?: ComponentsVariants['MuiFormikPhoneNumberInputField'];
    };
  }
}
//#endregion

export const getFormikPhoneNumberInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikPhoneNumberInputField', slot);
};

const slots: Record<
  FormikPhoneNumberInputFieldClassKey,
  [FormikPhoneNumberInputFieldClassKey]
> = {
  root: ['root'],
};

export const formikPhoneNumberInputFieldClasses: FormikPhoneNumberInputFieldClasses =
  generateUtilityClasses(
    'MuiFormikPhoneNumberInputField',
    Object.keys(slots) as FormikPhoneNumberInputFieldClassKey[]
  );

export type YupPhoneNumberValidationOptions = {
  message?: string;
  regionalCode?: CountryCode;
};

declare module 'yup' {
  interface StringSchema {
    phoneNumber(options?: YupPhoneNumberValidationOptions): StringSchema;
  }
}

addMethod(
  string,
  'phoneNumber',
  function ({
    message = 'Please enter a valid phone number',
    regionalCode,
  }: YupPhoneNumberValidationOptions = {}) {
    return this.test('phoneNumber', message, function (value) {
      return (
        value == null ||
        String(value).trim() == '' ||
        (typeof value === 'string' &&
          Boolean(isValidPhoneNumber(value, regionalCode)))
      );
    });
  }
);

export interface FormikPhoneNumberInputFieldProps
  extends PhoneNumberInputFieldProps {}

export const FormikPhoneNumberInputField = forwardRef<
  HTMLDivElement,
  FormikPhoneNumberInputFieldProps
>(function FormikPhoneNumberInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikPhoneNumberInputField',
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
    getFormikPhoneNumberInputFieldUtilityClass,
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
    <PhoneNumberInputField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikPhoneNumberInputField;
