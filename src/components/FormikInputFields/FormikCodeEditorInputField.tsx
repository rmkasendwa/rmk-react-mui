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
import CodeEditorInputField, {
  CodeEditorInputFieldProps,
} from '../InputFields/CodeEditorInputField';

export interface FormikCodeEditorInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikCodeEditorInputFieldClassKey =
  keyof FormikCodeEditorInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikCodeEditorInputField: FormikCodeEditorInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikCodeEditorInputField: keyof FormikCodeEditorInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikCodeEditorInputField?: {
      defaultProps?: ComponentsProps['MuiFormikCodeEditorInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikCodeEditorInputField'];
      variants?: ComponentsVariants['MuiFormikCodeEditorInputField'];
    };
  }
}
//#endregion

export const getFormikCodeEditorInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikCodeEditorInputField', slot);
};

const slots: Record<
  FormikCodeEditorInputFieldClassKey,
  [FormikCodeEditorInputFieldClassKey]
> = {
  root: ['root'],
};

export const formikCodeEditorInputFieldClasses: FormikCodeEditorInputFieldClasses =
  generateUtilityClasses(
    'MuiFormikCodeEditorInputField',
    Object.keys(slots) as FormikCodeEditorInputFieldClassKey[]
  );

export interface FormikCodeEditorInputFieldProps
  extends CodeEditorInputFieldProps {}

export const FormikCodeEditorInputField = forwardRef<
  HTMLDivElement,
  FormikCodeEditorInputFieldProps
>(function FormikCodeEditorInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikCodeEditorInputField',
  });
  const {
    className,
    name,
    value: valueProp,
    onChange: onChangeProp,
    error: errorProp,
    helperText: helperTextProp,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getFormikCodeEditorInputFieldUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { value, onChange, error, helperText } = useAggregatedFormikContext({
    value: valueProp,
    name,
    error: errorProp,
    helperText: helperTextProp,
    onChange: onChangeProp,
  });

  return (
    <CodeEditorInputField
      ref={ref}
      {...rest}
      {...{ value, onChange, error, helperText, name }}
      className={clsx(classes.root)}
    />
  );
});

export default FormikCodeEditorInputField;
