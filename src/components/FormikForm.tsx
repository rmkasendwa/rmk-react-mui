import { diff } from '@infinite-debugger/rmk-utils/data';
import {
  Box,
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
import { isEmpty } from 'lodash';
import { ReactElement, ReactNode, Ref, forwardRef } from 'react';

import FormikErrorFieldHighlighter, {
  FormikErrorFieldHighlighterFunctionChildrenProps,
  FormikErrorFieldHighlighterProps,
} from './FormikErrorFieldHighlighter';

export interface FormikFormClasses {
  /** Styles applied to the root element. */
  root: string;
  formFieldsWrapper: string;
}

export type FormikFormClassKey = keyof FormikFormClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikForm: FormikFormProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikForm: keyof FormikFormClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikForm?: {
      defaultProps?: ComponentsProps['MuiFormikForm'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikForm'];
      variants?: ComponentsVariants['MuiFormikForm'];
    };
  }
}
//#endregion

export const getFormikFormUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikForm', slot);
};

const slots: Record<FormikFormClassKey, [FormikFormClassKey]> = {
  root: ['root'],
  formFieldsWrapper: ['formFieldsWrapper'],
};

export const formikFormClasses: FormikFormClasses = generateUtilityClasses(
  'MuiFormikForm',
  Object.keys(slots) as FormikFormClassKey[]
);

export type FormikFormFunctionChildren<
  Values extends FormikValues = any,
  ExtraProps = Record<string, unknown>
> = (
  props: FormikProps<Values> &
    FormikErrorFieldHighlighterFunctionChildrenProps & {
      formHasChanges?: boolean;
      changedValues?: Partial<Values>;
    } & ExtraProps
) => ReactNode;

export interface FormikFormProps<
  Values extends FormikValues = any,
  ExtraProps = Record<string, unknown>
> extends Partial<
      Omit<FormikErrorFieldHighlighterProps, 'onSubmit' | 'children' | 'ref'>
    >,
    Required<Pick<FormikConfig<Values>, 'validationSchema' | 'onSubmit'>>,
    Pick<FormikConfig<Values>, 'enableReinitialize'> {
  /**
   * The initial values of the form.
   */
  initialValues: Values;

  /**
   * The children to render.
   */
  children: FormikFormFunctionChildren<Values, ExtraProps> | ReactNode;

  /**
   * The props to pass to the Formik component.
   */
  FormikProps?: Partial<FormikConfig<Values>>;

  /**
   * If true, the children will be wrapped in a `<Form>` component.
   */
  wrapChildrenInForm?: boolean;

  /**
   * The props to pass to the `<FormikErrorFieldHighlighter>` component.
   */
  FormikErrorFieldHighlighterProps?: Partial<
    Omit<FormikErrorFieldHighlighterProps, 'ref'>
  >;
}

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
    wrapChildrenInForm = true,
    FormikErrorFieldHighlighterProps = {},
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
      {({ values, ...formProps }) => {
        const changedValues = diff(values, initialValues, true);
        const formHasChanges = !isEmpty(changedValues);
        const formElementsNode = (
          <FormikErrorFieldHighlighter
            ref={ref}
            {...rest}
            {...FormikErrorFieldHighlighterProps}
            className={clsx(classes.root)}
          >
            {({ ...fieldHighlighterProps }) => {
              return typeof children === 'function'
                ? children({
                    values,
                    formHasChanges,
                    changedValues,
                    ...fieldHighlighterProps,
                    ...formProps,
                  })
                : children;
            }}
          </FormikErrorFieldHighlighter>
        );

        if (wrapChildrenInForm) {
          return (
            <Form className={clsx(classes.formFieldsWrapper)} noValidate>
              {formElementsNode}
            </Form>
          );
        }

        return (
          <Box className={clsx(classes.formFieldsWrapper)}>
            {formElementsNode}
          </Box>
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
