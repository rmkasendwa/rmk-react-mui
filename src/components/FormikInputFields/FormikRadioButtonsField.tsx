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
import RadioButtonsField, {
  RadioButtonsFieldProps,
} from '../InputFields/RadioButtonsField';

export interface FormikRadioButtonsFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikRadioButtonsFieldClassKey =
  keyof FormikRadioButtonsFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikRadioButtonsField: FormikRadioButtonsFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikRadioButtonsField: keyof FormikRadioButtonsFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikRadioButtonsField?: {
      defaultProps?: ComponentsProps['MuiFormikRadioButtonsField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikRadioButtonsField'];
      variants?: ComponentsVariants['MuiFormikRadioButtonsField'];
    };
  }
}
//#endregion

export const getFormikRadioButtonsFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikRadioButtonsField', slot);
};

const slots: Record<
  FormikRadioButtonsFieldClassKey,
  [FormikRadioButtonsFieldClassKey]
> = {
  root: ['root'],
};

export const formikRadioButtonsFieldClasses: FormikRadioButtonsFieldClasses =
  generateUtilityClasses(
    'MuiFormikRadioButtonsField',
    Object.keys(slots) as FormikRadioButtonsFieldClassKey[]
  );

export interface FormikRadioButtonsFieldProps extends RadioButtonsFieldProps {}

export const FormikRadioButtonsField = forwardRef<
  HTMLDivElement,
  FormikRadioButtonsFieldProps
>(function FormikRadioButtonsField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikRadioButtonsField',
  });
  const {
    className,
    name,
    value: valueProp,
    error: errorProp,
    helperText: helperTextProp,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getFormikRadioButtonsFieldUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const {
    value = '',
    onChange,
    error,
    helperText,
  } = useAggregatedFormikContext({
    value: valueProp,
    name,
    error: errorProp,
    helperText: helperTextProp,
  });

  return (
    <RadioButtonsField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...{ name, value, onChange, error, helperText }}
    />
  );
});

export default FormikRadioButtonsField;
