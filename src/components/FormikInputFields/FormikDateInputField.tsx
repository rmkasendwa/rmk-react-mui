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
import DateInputField, {
  DateInputFieldProps,
} from '../InputFields/DateInputField';

export interface FormikDateInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikDateInputFieldClassKey = keyof FormikDateInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikDateInputField: FormikDateInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikDateInputField: keyof FormikDateInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikDateInputField?: {
      defaultProps?: ComponentsProps['MuiFormikDateInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikDateInputField'];
      variants?: ComponentsVariants['MuiFormikDateInputField'];
    };
  }
}
//#endregion

export const getFormikDateInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikDateInputField', slot);
};

const slots: Record<
  FormikDateInputFieldClassKey,
  [FormikDateInputFieldClassKey]
> = {
  root: ['root'],
};

export const formikDateInputFieldClasses: FormikDateInputFieldClasses =
  generateUtilityClasses(
    'MuiFormikDateInputField',
    Object.keys(slots) as FormikDateInputFieldClassKey[]
  );

export interface FormikDateInputFieldProps extends DateInputFieldProps {}

export const FormikDateInputField = forwardRef<
  HTMLDivElement,
  FormikDateInputFieldProps
>(function FormikDateInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikDateInputField',
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
    getFormikDateInputFieldUtilityClass,
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
    <DateInputField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikDateInputField;
