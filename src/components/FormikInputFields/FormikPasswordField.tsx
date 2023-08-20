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
import PasswordField, {
  PasswordFieldProps,
} from '../InputFields/PasswordField';

export interface FormikPasswordFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikPasswordFieldClassKey = keyof FormikPasswordFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikPasswordField: FormikPasswordFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikPasswordField: keyof FormikPasswordFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikPasswordField?: {
      defaultProps?: ComponentsProps['MuiFormikPasswordField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikPasswordField'];
      variants?: ComponentsVariants['MuiFormikPasswordField'];
    };
  }
}
//#endregion

export const getFormikPasswordFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikPasswordField', slot);
};

const slots: Record<
  FormikPasswordFieldClassKey,
  [FormikPasswordFieldClassKey]
> = {
  root: ['root'],
};

export const formikPasswordFieldClasses: FormikPasswordFieldClasses =
  generateUtilityClasses(
    'MuiFormikPasswordField',
    Object.keys(slots) as FormikPasswordFieldClassKey[]
  );

export interface FormikPasswordFieldProps extends PasswordFieldProps {}

export const FormikPasswordField = forwardRef<
  HTMLDivElement,
  FormikPasswordFieldProps
>(function FormikPasswordField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikPasswordField',
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
    getFormikPasswordFieldUtilityClass,
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
    <PasswordField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikPasswordField;
