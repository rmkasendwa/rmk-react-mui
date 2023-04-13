import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  ButtonProps,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useMediaQuery,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import clsx from 'clsx';
import { FormikValues } from 'formik';
import { Children, ReactElement, ReactNode, Ref, forwardRef } from 'react';

import { useLoadingContext } from '../contexts/LoadingContext';
import { useMessagingContext } from '../contexts/MessagingContext';
import ErrorAlert from './ErrorAlert';
import FixedHeaderContentArea from './FixedHeaderContentArea';
import FormikForm, { FormikFormProps } from './FormikForm';
import { PaddedContentAreaProps } from './PaddedContentArea';

export interface FormWrapperClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormWrapperClassKey = keyof FormWrapperClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormWrapper: FormWrapperProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormWrapper: keyof FormWrapperClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormWrapper?: {
      defaultProps?: ComponentsProps['MuiFormWrapper'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormWrapper'];
      variants?: ComponentsVariants['MuiFormWrapper'];
    };
  }
}

export interface FormWrapperProps<Values extends FormikValues = any>
  extends Partial<
      Omit<
        FormikFormProps<Values>,
        'title' | 'ref' | 'initialValues' | 'validationSchema'
      >
    >,
    Pick<FormikFormProps<Values>, 'initialValues' | 'validationSchema'>,
    Omit<PaddedContentAreaProps, 'onSubmit' | 'children'> {
  formTools?: ReactNode | ReactNode[];
  SubmitButtonProps?: Partial<ButtonProps>;
  CancelButtonProps?: Partial<ButtonProps>;
  cancelButtonAction?: 'navigate-to-previous-page' | 'none';
  errorMessage?: string;
  successMessage?: string;
}

export function getFormWrapperUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFormWrapper', slot);
}

export const formWrapperClasses: FormWrapperClasses = generateUtilityClasses(
  'MuiFormWrapper',
  ['root']
);

const slots = {
  root: ['root'],
};

export const BaseFormWrapper = <Values extends FormikValues>(
  inProps: FormWrapperProps<Values>,
  ref: Ref<HTMLDivElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiFormWrapper' });
  const {
    className,
    children,
    title,
    breadcrumbs,
    initialValues,
    validationSchema,
    onSubmit,
    tools,
    formTools,
    SubmitButtonProps = {},
    CancelButtonProps = {},
    cancelButtonAction = 'navigate-to-previous-page',
    errorMessage: errorMessageProp,
    successMessage,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getFormWrapperUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { ...SubmitButtonPropsRest } = SubmitButtonProps;
  const { ...CancelButtonPropsRest } = CancelButtonProps;

  const { breakpoints } = useTheme();
  const smallScreen = useMediaQuery(breakpoints.down('sm'));

  const { showSuccessMessage } = useMessagingContext();

  const {
    load,
    loading,
    errorMessage: loadingContextErrorMessage,
  } = useLoadingContext();

  const errorMessage = errorMessageProp || loadingContextErrorMessage;

  return (
    <FixedHeaderContentArea
      {...{ title, breadcrumbs, tools }}
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
    >
      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <ErrorAlert message={errorMessage} retry={load} />
        </Box>
      )}
      <FormikForm
        {...{ initialValues, validationSchema }}
        onSubmit={async (values, formikHelpers) => {
          onSubmit && (await onSubmit(values, formikHelpers));
          successMessage && showSuccessMessage(successMessage);
        }}
        enableReinitialize
      >
        {({ isSubmitting, ...rest }) => {
          return (
            <>
              {typeof children === 'function'
                ? children({ isSubmitting, ...rest })
                : children}
              {!loading && !errorMessage ? (
                <Grid container spacing={1} sx={{ mt: 2 }}>
                  {smallScreen ? null : <Grid item xs />}
                  <Grid item xs={smallScreen}>
                    <Button
                      color="inherit"
                      variant="contained"
                      onClick={() => {
                        if (
                          cancelButtonAction === 'navigate-to-previous-page'
                        ) {
                          window.history.back();
                        }
                      }}
                      {...CancelButtonPropsRest}
                    >
                      Cancel
                    </Button>
                  </Grid>
                  {(() => {
                    if (formTools) {
                      return Children.toArray(formTools).map((tool, index) => {
                        return (
                          <Grid item key={index} xs={smallScreen}>
                            {tool}
                          </Grid>
                        );
                      });
                    }
                  })()}
                  <Grid item xs={smallScreen}>
                    <LoadingButton
                      color="success"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      fullWidth={smallScreen}
                      type="submit"
                      loading={isSubmitting}
                      {...SubmitButtonPropsRest}
                    >
                      Save Changes
                    </LoadingButton>
                  </Grid>
                </Grid>
              ) : null}
            </>
          );
        }}
      </FormikForm>
    </FixedHeaderContentArea>
  );
};

export const FormWrapper = forwardRef(BaseFormWrapper) as <
  Values extends FormikValues
>(
  p: FormWrapperProps<Values> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default FormWrapper;
