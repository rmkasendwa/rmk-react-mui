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
import KeyValuePairEditor, {
  KeyValuePairEditorProps,
} from '../InputFields/KeyValuePairEditor';

export interface FormikKeyValuePairEditorClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikKeyValuePairEditorClassKey =
  keyof FormikKeyValuePairEditorClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikKeyValuePairEditor: FormikKeyValuePairEditorProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikKeyValuePairEditor: keyof FormikKeyValuePairEditorClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikKeyValuePairEditor?: {
      defaultProps?: ComponentsProps['MuiFormikKeyValuePairEditor'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikKeyValuePairEditor'];
      variants?: ComponentsVariants['MuiFormikKeyValuePairEditor'];
    };
  }
}
//#endregion

export const getFormikKeyValuePairEditorUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikKeyValuePairEditor', slot);
};

const slots: Record<
  FormikKeyValuePairEditorClassKey,
  [FormikKeyValuePairEditorClassKey]
> = {
  root: ['root'],
};

export const formikKeyValuePairEditorClasses: FormikKeyValuePairEditorClasses =
  generateUtilityClasses(
    'MuiFormikKeyValuePairEditor',
    Object.keys(slots) as FormikKeyValuePairEditorClassKey[]
  );

export interface FormikKeyValuePairEditorProps
  extends Partial<KeyValuePairEditorProps> {}

export const FormikKeyValuePairEditor = forwardRef<
  HTMLDivElement,
  FormikKeyValuePairEditorProps
>(function FormikKeyValuePairEditor(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikKeyValuePairEditor',
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
    getFormikKeyValuePairEditorUtilityClass,
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
  });

  return (
    <KeyValuePairEditor
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...{ name, value, onChange, error, helperText }}
    />
  );
});

export default FormikKeyValuePairEditor;
