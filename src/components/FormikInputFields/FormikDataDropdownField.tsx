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
import { ReactElement, Ref, forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import DataDropdownField, {
  DataDropdownFieldProps,
} from '../InputFields/DataDropdownField';

export interface FormikDataDropdownFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikDataDropdownFieldClassKey =
  keyof FormikDataDropdownFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikDataDropdownField: FormikDataDropdownFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikDataDropdownField: keyof FormikDataDropdownFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikDataDropdownField?: {
      defaultProps?: ComponentsProps['MuiFormikDataDropdownField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikDataDropdownField'];
      variants?: ComponentsVariants['MuiFormikDataDropdownField'];
    };
  }
}
//#endregion

export const getFormikDataDropdownFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikDataDropdownField', slot);
};

const slots: Record<
  FormikDataDropdownFieldClassKey,
  [FormikDataDropdownFieldClassKey]
> = {
  root: ['root'],
};

export const formikDataDropdownFieldClasses: FormikDataDropdownFieldClasses =
  generateUtilityClasses(
    'MuiFormikDataDropdownField',
    Object.keys(slots) as FormikDataDropdownFieldClassKey[]
  );

export interface FormikDataDropdownFieldProps<Entity = any>
  extends DataDropdownFieldProps<Entity> {}

export const BaseFormikDataDropdownField = <Entity,>(
  inProps: FormikDataDropdownFieldProps<Entity>,
  ref: Ref<HTMLDivElement>
) => {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikDataDropdownField',
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
    getFormikDataDropdownFieldUtilityClass,
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
    <DataDropdownField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
};

export const FormikDataDropdownField = forwardRef(
  BaseFormikDataDropdownField
) as <Entity>(
  p: FormikDataDropdownFieldProps<Entity> & {
    ref?: Ref<HTMLDivElement>;
  }
) => ReactElement;

export default FormikDataDropdownField;
