import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import {
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
import { Form, Formik, FormikHelpers, FormikProps, FormikValues } from 'formik';
import { Children, ReactNode, forwardRef } from 'react';

import { useLoadingContext } from '../contexts/LoadingContext';
import ErrorAlert from './ErrorAlert';
import ErrorFieldHighlighter from './ErrorFieldHighlighter';
import FixedHeaderContentArea from './FixedHeaderContentArea';
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

export interface FormWrapperProps<Values extends FormikValues = FormikValues>
  extends Omit<PaddedContentAreaProps, 'onSubmit' | 'children'> {
  initialValues?: Values;
  validationSchema?: any;
  onSubmit?: (
    values: any,
    formikHelpers: FormikHelpers<Values>
  ) => void | Promise<any>;
  children?: ((props: FormikProps<Values>) => ReactNode) | ReactNode;
  formTools?: ReactNode | ReactNode[];
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

export const FormWrapper = forwardRef<HTMLDivElement, FormWrapperProps>(
  function FormWrapper(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiFormWrapper' });
    const {
      className,
      children,
      title,
      breadcrumbs,
      initialValues = {},
      validationSchema,
      onSubmit,
      tools,
      formTools,
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

    const { breakpoints } = useTheme();
    const smallScreen = useMediaQuery(breakpoints.down('sm'));

    const { load, loading, errorMessage } = useLoadingContext();

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
        <Formik
          {...{ initialValues, validationSchema }}
          onSubmit={async (values, formikHelpers) => {
            onSubmit && (await onSubmit(values, formikHelpers));
          }}
          enableReinitialize
        >
          {({ isSubmitting, ...rest }) => {
            return (
              <Form noValidate>
                <ErrorFieldHighlighter />
                {typeof children === 'function'
                  ? children({ isSubmitting, ...rest })
                  : children}
                {!loading && !errorMessage ? (
                  <Grid container sx={{ mt: 2 }}>
                    {smallScreen ? null : <Grid item xs />}
                    {(() => {
                      if (formTools) {
                        return Children.toArray(formTools).map(
                          (tool, index) => {
                            return (
                              <Grid item key={index} xs={smallScreen}>
                                {tool}
                              </Grid>
                            );
                          }
                        );
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
                      >
                        Save Changes
                      </LoadingButton>
                    </Grid>
                  </Grid>
                ) : null}
              </Form>
            );
          }}
        </Formik>
      </FixedHeaderContentArea>
    );
  }
);

export default FormWrapper;
