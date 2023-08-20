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
import TextAreaField, {
  TextAreaFieldProps,
} from '../InputFields/TextAreaField';

export interface FormikTextAreaFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikTextAreaFieldClassKey = keyof FormikTextAreaFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikTextAreaField: FormikTextAreaFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikTextAreaField: keyof FormikTextAreaFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikTextAreaField?: {
      defaultProps?: ComponentsProps['MuiFormikTextAreaField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikTextAreaField'];
      variants?: ComponentsVariants['MuiFormikTextAreaField'];
    };
  }
}
//#endregion

export const getFormikTextAreaFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikTextAreaField', slot);
};

const slots: Record<
  FormikTextAreaFieldClassKey,
  [FormikTextAreaFieldClassKey]
> = {
  root: ['root'],
};

export const formikTextAreaFieldClasses: FormikTextAreaFieldClasses =
  generateUtilityClasses(
    'MuiFormikTextAreaField',
    Object.keys(slots) as FormikTextAreaFieldClassKey[]
  );

export interface FormikTextAreaFieldProps extends TextAreaFieldProps {}

export const FormikTextAreaField = forwardRef<
  HTMLDivElement,
  FormikTextAreaFieldProps
>(function FormikTextAreaField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikTextAreaField',
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
    getFormikTextAreaFieldUtilityClass,
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
    <TextAreaField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...{ name, value, onChange, onBlur, error, helperText }}
    />
  );
});

export default FormikTextAreaField;
