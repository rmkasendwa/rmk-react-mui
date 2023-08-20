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
import FileInputField, {
  FileInputFieldProps,
} from '../InputFields/FileInputField';

export interface FormikFileInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikFileInputFieldClassKey = keyof FormikFileInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikFileInputField: FormikFileInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikFileInputField: keyof FormikFileInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikFileInputField?: {
      defaultProps?: ComponentsProps['MuiFormikFileInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikFileInputField'];
      variants?: ComponentsVariants['MuiFormikFileInputField'];
    };
  }
}
//#endregion

export const getFormikFileInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikFileInputField', slot);
};

const slots: Record<
  FormikFileInputFieldClassKey,
  [FormikFileInputFieldClassKey]
> = {
  root: ['root'],
};

export const formikFileInputFieldClasses: FormikFileInputFieldClasses =
  generateUtilityClasses(
    'MuiFormikFileInputField',
    Object.keys(slots) as FormikFileInputFieldClassKey[]
  );

export interface FormikFileInputFieldProps extends FileInputFieldProps {}

export const FormikFileInputField = forwardRef<
  HTMLDivElement,
  FormikFileInputFieldProps
>(function FormikFileInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikFileInputField',
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
    getFormikFileInputFieldUtilityClass,
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
    <FileInputField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...({ name, value, onChange, onBlur, error, helperText } as any)}
    />
  );
});

export default FormikFileInputField;
