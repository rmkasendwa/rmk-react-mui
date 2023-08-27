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
import {
  Children,
  ReactElement,
  ReactNode,
  Ref,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { LoadingProvider, useLoadingContext } from '../contexts/LoadingContext';
import { useMessagingContext } from '../contexts/MessagingContext';
import {
  CacheableDataFinderOptions,
  useCacheableData,
  useMutation,
} from '../hooks/Utils';
import { CrudMode } from '../models/Utils';
import ErrorAlert from './ErrorAlert';
import FixedHeaderContentArea from './FixedHeaderContentArea';
import { formikErrorFieldHighlighterClasses } from './FormikErrorFieldHighlighter';
import FormikForm, { FormikFormProps } from './FormikForm';
import { PaddedContentAreaProps } from './PaddedContentArea';

export interface FormWrapperClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormWrapperClassKey = keyof FormWrapperClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormWrapper: FormWrapperProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormWrapper: keyof FormWrapperClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormWrapper?: {
      defaultProps?: ComponentsProps['MuiFormWrapper'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormWrapper'];
      variants?: ComponentsVariants['MuiFormWrapper'];
    };
  }
}
//#endregion

export const getFormWrapperUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormWrapper', slot);
};

const slots: Record<FormWrapperClassKey, [FormWrapperClassKey]> = {
  root: ['root'],
};

export const formWrapperClasses: FormWrapperClasses = generateUtilityClasses(
  'MuiFormWrapper',
  Object.keys(slots) as FormWrapperClassKey[]
);

export interface FormWrapperProps<
  RecordRow = any,
  Values extends FormikValues = any,
  LoadedRecord = RecordRow
> extends Partial<
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
  recordFinder?: (options: CacheableDataFinderOptions) => Promise<RecordRow>;
  getEditableRecordInitialValues?: (record: LoadedRecord) => Values;
  mode?: CrudMode;
  onSubmitSuccess?: () => void;
  onLoadRecord?: (record: LoadedRecord) => void;
}

const BaseFormWrapper = <RecordRow, Values extends FormikValues>(
  inProps: FormWrapperProps<RecordRow, Values>,
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
    recordFinder,
    mode = 'create',
    getEditableRecordInitialValues,
    onSubmitSuccess,
    onLoadRecord,
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

  const getEditableRecordInitialValuesRef = useRef(
    getEditableRecordInitialValues
  );
  getEditableRecordInitialValuesRef.current = getEditableRecordInitialValues;
  const onSubmitSuccessRef = useRef(onSubmitSuccess);
  onSubmitSuccessRef.current = onSubmitSuccess;
  const onLoadRecordRef = useRef(onLoadRecord);
  onLoadRecordRef.current = onLoadRecord;

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

  const {
    load: loadRecord,
    loading: loadingRecord,
    errorMessage: loadingRecordErrorMessage,
    data: loadedRecord,
  } = useCacheableData(
    async (options) => {
      if (recordFinder && mode === 'edit') {
        return recordFinder(options);
      }
    },
    {
      loadOnMount: Boolean(recordFinder),
      autoSync: false,
    }
  );

  useEffect(() => {
    if (loadedRecord && onLoadRecordRef.current) {
      onLoadRecordRef.current(loadedRecord);
    }
  }, [loadedRecord]);

  const {
    mutate,
    mutating,
    mutated,
    errorMessage: mutatingErrorMessage,
    reset: resetMutationState,
  } = useMutation(async (...args: Parameters<NonNullable<typeof onSubmit>>) => {
    if (onSubmit) {
      return onSubmit(...args);
    }
  });

  useEffect(() => {
    if (mutated) {
      (async () => {
        successMessage && showSuccessMessage(successMessage);
        onSubmitSuccessRef.current && (await onSubmitSuccessRef.current());
        resetMutationState();
      })();
    }
  }, [mutated, resetMutationState, showSuccessMessage, successMessage]);

  const editInitialValues = useMemo(() => {
    if (getEditableRecordInitialValuesRef.current && loadedRecord) {
      return getEditableRecordInitialValuesRef.current(loadedRecord);
    }
    return { ...initialValues, ...(loadedRecord as any) };
  }, [loadedRecord, initialValues]);

  const errorMessage =
    errorMessageProp || loadingContextErrorMessage || mutatingErrorMessage;

  return (
    <FixedHeaderContentArea
      {...{ title, breadcrumbs, tools }}
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      BodyProps={{
        sx: {
          [`&,&>form,.${formikErrorFieldHighlighterClasses.root}`]: {
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            flex: 1,
          },
        },
      }}
      sx={{
        bottom: 'auto',
        maxHeight: '100%',
      }}
    >
      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <ErrorAlert message={errorMessage} retry={load} />
        </Box>
      )}
      <LoadingProvider
        value={{
          load: loadRecord,
          loading: loadingRecord || loading || mutating,
          errorMessage: loadingRecordErrorMessage || loadingContextErrorMessage,
        }}
      >
        <FormikForm
          validationSchema={validationSchema}
          initialValues={editInitialValues}
          onSubmit={async (values, formikHelpers) => {
            if (onSubmit) {
              return mutate(values, formikHelpers);
            }
          }}
          enableReinitialize
        >
          {({ isSubmitting, formHasChanges, ...rest }) => {
            return (
              <>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                  }}
                >
                  {typeof children === 'function'
                    ? children({ isSubmitting, formHasChanges, ...rest })
                    : children}
                </Box>
                <Grid container spacing={1} sx={{ py: 2 }}>
                  {smallScreen ? null : <Grid item xs />}
                  <Grid item xs={smallScreen}>
                    <Button
                      color="inherit"
                      variant="text"
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
                      loading={isSubmitting || mutating || loading}
                      disabled={
                        isSubmitting || mutating || loading || !formHasChanges
                      }
                      {...SubmitButtonPropsRest}
                    >
                      Save Changes
                    </LoadingButton>
                  </Grid>
                </Grid>
              </>
            );
          }}
        </FormikForm>
      </LoadingProvider>
    </FixedHeaderContentArea>
  );
};

export const FormWrapper = forwardRef(BaseFormWrapper) as <
  RecordRow,
  Values extends FormikValues
>(
  p: FormWrapperProps<RecordRow, Values> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default FormWrapper;
