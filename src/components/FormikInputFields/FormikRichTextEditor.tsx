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
import RichTextEditor, { RichTextEditorProps } from '../RichTextEditor';

export interface FormikRichTextEditorClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikRichTextEditorClassKey = keyof FormikRichTextEditorClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikRichTextEditor: FormikRichTextEditorProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikRichTextEditor: keyof FormikRichTextEditorClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikRichTextEditor?: {
      defaultProps?: ComponentsProps['MuiFormikRichTextEditor'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikRichTextEditor'];
      variants?: ComponentsVariants['MuiFormikRichTextEditor'];
    };
  }
}
//#endregion

export const getFormikRichTextEditorUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikRichTextEditor', slot);
};

const slots: Record<
  FormikRichTextEditorClassKey,
  [FormikRichTextEditorClassKey]
> = {
  root: ['root'],
};

export const formikRichTextEditorClasses: FormikRichTextEditorClasses =
  generateUtilityClasses(
    'MuiFormikRichTextEditor',
    Object.keys(slots) as FormikRichTextEditorClassKey[]
  );

export interface FormikRichTextEditorProps extends RichTextEditorProps {}

export const FormikRichTextEditor = forwardRef<
  HTMLDivElement,
  FormikRichTextEditorProps
>(function FormikRichTextEditor(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikRichTextEditor',
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
    getFormikRichTextEditorUtilityClass,
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
    <RichTextEditor
      ref={ref}
      {...rest}
      {...{ value, onChange, error, helperText, name }}
      className={clsx(classes.root)}
    />
  );
});

export default FormikRichTextEditor;
