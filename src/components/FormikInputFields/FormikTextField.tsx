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
import TextField, { TextFieldProps } from '../InputFields/TextField';

export interface FormikTextFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikTextFieldClassKey = keyof FormikTextFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikTextField: FormikTextFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikTextField: keyof FormikTextFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikTextField?: {
      defaultProps?: ComponentsProps['MuiFormikTextField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikTextField'];
      variants?: ComponentsVariants['MuiFormikTextField'];
    };
  }
}
//#endregion

export const getFormikTextFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikTextField', slot);
};

const slots: Record<FormikTextFieldClassKey, [FormikTextFieldClassKey]> = {
  root: ['root'],
};

export const formikTextFieldClasses: FormikTextFieldClasses =
  generateUtilityClasses(
    'MuiFormikTextField',
    Object.keys(slots) as FormikTextFieldClassKey[]
  );

export interface FormikTextFieldProps extends TextFieldProps {}

export const FormikTextField = forwardRef<HTMLDivElement, FormikTextFieldProps>(
  function FormikTextField(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiFormikTextField' });
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
      getFormikTextFieldUtilityClass,
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
      <TextField
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        {...{ name, value, onChange, onBlur, error, helperText }}
      />
    );
  }
);

export default FormikTextField;
