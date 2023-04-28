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
import { Form, Formik, FormikConfig, FormikProps, FormikValues } from 'formik';
import { ReactElement, ReactNode, Ref, forwardRef } from 'react';

import FormikErrorFieldHighlighter, {
  FormikErrorFieldHighlighterProps,
} from './FormikErrorFieldHighlighter';

export interface FormikFormClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikFormClassKey = keyof FormikFormClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikForm: FormikFormProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikForm: keyof FormikFormClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikForm?: {
      defaultProps?: ComponentsProps['MuiFormikForm'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikForm'];
      variants?: ComponentsVariants['MuiFormikForm'];
    };
  }
}

export type FormikFormFunctionChildren<
  Values extends FormikValues = any,
  ExtraProps = Record<string, unknown>
> = (props: FormikProps<Values> & ExtraProps) => ReactNode;

export interface FormikFormProps<Values extends FormikValues = any>
  extends Partial<
      Omit<FormikErrorFieldHighlighterProps, 'onSubmit' | 'children' | 'ref'>
    >,
    Required<Pick<FormikConfig<Values>, 'validationSchema' | 'onSubmit'>>,
    Pick<FormikConfig<Values>, 'enableReinitialize'> {
  initialValues: Values;
  children: FormikFormFunctionChildren | ReactNode;
  FormikProps?: Partial<FormikConfig<Values>>;
}

export function getFormikFormUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFormikForm', slot);
}

export const formikFormClasses: FormikFormClasses = generateUtilityClasses(
  'MuiFormikForm',
  ['root']
);

const slots = {
  root: ['root'],
};

const BaseFormikForm = <Values extends FormikValues>(
  inProps: FormikFormProps<Values>,
  ref: Ref<HTMLDivElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiFormikForm' });
  const {
    className,
    validationSchema,
    initialValues,
    onSubmit,
    enableReinitialize,
    children,
    FormikProps = {},
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getFormikFormUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  return (
    <Formik
      {...{ validationSchema, initialValues, onSubmit, enableReinitialize }}
      {...FormikProps}
    >
      {({ ...formProps }) => {
        return (
          <Form noValidate>
            <FormikErrorFieldHighlighter
              ref={ref}
              {...rest}
              className={clsx(classes.root)}
            >
              {typeof children === 'function'
                ? children({
                    ...formProps,
                  })
                : children}
            </FormikErrorFieldHighlighter>
          </Form>
        );
      }}
    </Formik>
  );
};

export const FormikForm = forwardRef(BaseFormikForm) as <
  Values extends FormikValues
>(
  p: FormikFormProps<Values> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default FormikForm;