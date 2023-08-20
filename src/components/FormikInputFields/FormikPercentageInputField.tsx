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
import PercentageInputField, {
  PercentageInputFieldProps,
} from '../InputFields/PercentageInputField';

export interface FormikPercentageInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikPercentageInputFieldClassKey =
  keyof FormikPercentageInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikPercentageInputField: FormikPercentageInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikPercentageInputField: keyof FormikPercentageInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikPercentageInputField?: {
      defaultProps?: ComponentsProps['MuiFormikPercentageInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikPercentageInputField'];
      variants?: ComponentsVariants['MuiFormikPercentageInputField'];
    };
  }
}
//#endregion

export const getFormikPercentageInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikPercentageInputField', slot);
};

const slots: Record<
  FormikPercentageInputFieldClassKey,
  [FormikPercentageInputFieldClassKey]
> = {
  root: ['root'],
};

export const formikPercentageInputFieldClasses: FormikPercentageInputFieldClasses =
  generateUtilityClasses(
    'MuiFormikPercentageInputField',
    Object.keys(slots) as FormikPercentageInputFieldClassKey[]
  );

export interface FormikPercentageInputFieldProps
  extends PercentageInputFieldProps {}

export const FormikPercentageInputField = forwardRef<
  HTMLDivElement,
  FormikPercentageInputFieldProps
>(function FormikPercentageInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikPercentageInputField',
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
    getFormikPercentageInputFieldUtilityClass,
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
    <PercentageInputField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikPercentageInputField;
