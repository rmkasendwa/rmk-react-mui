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
import FileUploader, { FileUploaderProps } from '../FileUploader';

export interface FormikFileUploaderClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikFileUploaderClassKey = keyof FormikFileUploaderClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikFileUploader: FormikFileUploaderProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikFileUploader: keyof FormikFileUploaderClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikFileUploader?: {
      defaultProps?: ComponentsProps['MuiFormikFileUploader'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikFileUploader'];
      variants?: ComponentsVariants['MuiFormikFileUploader'];
    };
  }
}
//#endregion

export const getFormikFileUploaderUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikFileUploader', slot);
};

const slots: Record<FormikFileUploaderClassKey, [FormikFileUploaderClassKey]> =
  {
    root: ['root'],
  };

export const formikFileUploaderClasses: FormikFileUploaderClasses =
  generateUtilityClasses(
    'MuiFormikFileUploader',
    Object.keys(slots) as FormikFileUploaderClassKey[]
  );

export interface FormikFileUploaderProps extends FileUploaderProps {}

export const FormikFileUploader = forwardRef<
  HTMLDivElement,
  FormikFileUploaderProps
>(function FormikFileUploader(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikFileUploader',
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
    getFormikFileUploaderUtilityClass,
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
    <FileUploader
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...({ name, value, onChange, error, helperText } as any)}
    />
  );
});

export default FormikFileUploader;
