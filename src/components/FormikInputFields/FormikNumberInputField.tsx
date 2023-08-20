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
import NumberInputField, {
  NumberInputFieldProps,
} from '../InputFields/NumberInputField';

export interface FormikNumberInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikNumberInputFieldClassKey =
  keyof FormikNumberInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikNumberInputField: FormikNumberInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikNumberInputField: keyof FormikNumberInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikNumberInputField?: {
      defaultProps?: ComponentsProps['MuiFormikNumberInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikNumberInputField'];
      variants?: ComponentsVariants['MuiFormikNumberInputField'];
    };
  }
}
//#endregion

export const getFormikNumberInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikNumberInputField', slot);
};

const slots: Record<
  FormikNumberInputFieldClassKey,
  [FormikNumberInputFieldClassKey]
> = {
  root: ['root'],
};

export const formikNumberInputFieldClasses: FormikNumberInputFieldClasses =
  generateUtilityClasses(
    'MuiFormikNumberInputField',
    Object.keys(slots) as FormikNumberInputFieldClassKey[]
  );

export interface FormikNumberInputFieldProps extends NumberInputFieldProps {}

export const FormikNumberInputField = forwardRef<
  HTMLDivElement,
  FormikNumberInputFieldProps
>(function FormikNumberInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikNumberInputField',
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
    getFormikNumberInputFieldUtilityClass,
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
    <NumberInputField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikNumberInputField;
