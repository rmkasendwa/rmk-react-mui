import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from '@mui/lab';
import { Box, Grid } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps, FormikValues } from 'formik';
import { FC, ReactNode } from 'react';

import { useLoadingContext, useSmallScreen } from '../hooks';
import ErrorAlert from './ErrorAlert';
import ErrorFieldHighlighter from './ErrorFieldHighlighter';
import PaddedContentArea, {
  IPaddedContentAreaProps,
} from './PaddedContentArea';

export interface IFormWrapperProps<Values extends FormikValues = FormikValues>
  extends Omit<IPaddedContentAreaProps, 'onSubmit'> {
  initialValues?: Values;
  validationSchema?: any;
  onSubmit?: (
    values: any,
    formikHelpers: FormikHelpers<Values>
  ) => void | Promise<any>;
  children?: ((props: FormikProps<Values>) => ReactNode) | ReactNode;
}

export const FormWrapper: FC<IFormWrapperProps> = ({
  children,
  title,
  tools,
  showBreadcrumbs,
  initialValues = {},
  validationSchema,
  onSubmit,
}) => {
  const smallScreen = useSmallScreen();

  const { load, loading, errorMessage } = useLoadingContext();

  return (
    <PaddedContentArea
      title={title}
      tools={tools}
      showBreadcrumbs={showBreadcrumbs}
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
                  <Grid item xs={smallScreen}>
                    <LoadingButton
                      color="success"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      fullWidth={smallScreen}
                      type="submit"
                      loading={isSubmitting}
                    >
                      Save
                    </LoadingButton>
                  </Grid>
                </Grid>
              ) : null}
            </Form>
          );
        }}
      </Formik>
    </PaddedContentArea>
  );
};

export default FormWrapper;
