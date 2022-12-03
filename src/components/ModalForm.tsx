import { diff } from '@infinite-debugger/rmk-utils/data';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  Card,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Grid,
  IconButton,
  Modal,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { Form, Formik, FormikConfig, FormikProps, FormikValues } from 'formik';
import { isEmpty } from 'lodash';
import {
  Children,
  ReactElement,
  ReactNode,
  Ref,
  forwardRef,
  useEffect,
  useRef,
} from 'react';

import ErrorAlert from './ErrorAlert';
import ErrorFieldHighlighter from './ErrorFieldHighlighter';
import { ModalPopupProps } from './ModalPopup';
import SearchSyncToolbar, { SearchSyncToolbarProps } from './SearchSyncToolbar';

export interface ModalFormClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ModalFormClassKey = keyof ModalFormClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiModalForm: ModalFormProps<FormikValues>;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiModalForm: keyof ModalFormClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiModalForm?: {
      defaultProps?: ComponentsProps['MuiModalForm'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiModalForm'];
      variants?: ComponentsVariants['MuiModalForm'];
    };
  }
}

export type ModalFormFunctionChildren<
  Values extends FormikValues = any,
  ExtraProps = Record<string, unknown>
> = (props: FormikProps<Values> & ExtraProps) => ReactNode;

export interface ModalFormProps<Values extends FormikValues = any>
  extends Omit<ModalPopupProps, 'children'>,
    NonNullable<Pick<FormikConfig<Values>, 'validationSchema'>> {
  initialValues: Values;
  children: ModalFormFunctionChildren | ReactNode;
  successMessage?: string;
  submitted?: boolean;
  submitButtonText?: string;
  staticEntityDetails?: ReactNode;
  editMode?: boolean;
  showForm?: boolean;
  viewModeTools?: ReactNode | ReactNode[];
  /**
   * Determines if the submit button should be locked when the user doesn't perform any changes on the form.
   */
  lockSubmitIfNoChange?: boolean;
  /**
   * Determines if the submit button should be locked when the form is not valid.
   */
  lockSubmitIfFormInvalid?: boolean;
  onSubmit: (values: any) => void;
  onSubmitSuccess?: () => void;
  onClickEdit?: () => void;
  SubmitButtonProps?: Partial<LoadingButtonProps>;
  FormikProps?: Partial<FormikConfig<Values>>;
  loading?: boolean;
  ToolbarProps?: Partial<SearchSyncToolbarProps>;
  showCloseButton?: boolean;
  getModalElement?: (modalElement: ReactElement) => ReactElement;
}

export function getModalFormUtilityClass(slot: string): string {
  return generateUtilityClass('MuiModalForm', slot);
}

export const modalFormClasses: ModalFormClasses = generateUtilityClasses(
  'MuiModalForm',
  ['root']
);

const slots = {
  root: ['root'],
};

export const BaseModalForm = <Values extends FormikValues>(
  inProps: ModalFormProps<Values>,
  ref: Ref<HTMLTableElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiModalForm' });
  const {
    className,
    initialValues,
    validationSchema,
    FormikProps = {},
    children,
    errorMessage,
    successMessage,
    onSubmit,
    onSubmitSuccess,
    title,
    submitted = false,
    submitButtonText = 'Submit',
    open,
    onClose,
    staticEntityDetails,
    editMode = true,
    showForm = true,
    onClickEdit,
    viewModeTools,
    lockSubmitIfNoChange = true,
    lockSubmitIfFormInvalid = false,
    CardProps = {},
    SubmitButtonProps = {},
    ToolbarProps = {},
    showCloseButton = true,
    loading,
    getModalElement,
    sx,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getModalFormUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { palette, components } = useTheme();

  const { sx: CardPropsSx, ...CardPropsRest } = CardProps;
  const { ...SubmitButtonPropsRest } = SubmitButtonProps;
  const { ...ToolbarPropsRest } = ToolbarProps;

  const onSubmitSuccessRef = useRef(onSubmitSuccess);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onSubmitSuccessRef.current = onSubmitSuccess;
    onCloseRef.current = onClose;
  }, [onClose, onSubmitSuccess]);

  useEffect(() => {
    if (submitted && !successMessage) {
      onCloseRef.current && onCloseRef.current();
      onSubmitSuccessRef.current && onSubmitSuccessRef.current();
    }
  }, [submitted, successMessage]);

  const modalElement = (
    <Card
      {...CardPropsRest}
      sx={{
        width: '100%',
        maxWidth: 640,
        maxHeight: '80%',
        form: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
        ...CardPropsSx,
      }}
    >
      <Formik
        {...{ initialValues, validationSchema, onSubmit }}
        {...FormikProps}
        enableReinitialize
      >
        {({ isSubmitting, values, isValid, ...rest }) => {
          const formHasChanges = !isEmpty(diff(values, initialValues));
          return (
            <Form noValidate>
              <ErrorFieldHighlighter />
              <SearchSyncToolbar
                hasSearchTool={false}
                hasSyncTool={false}
                {...ToolbarPropsRest}
                title={title}
              >
                {(() => {
                  if (showCloseButton && !isSubmitting) {
                    return (
                      <IconButton onClick={onClose} sx={{ p: 0.5 }}>
                        <CloseIcon />
                      </IconButton>
                    );
                  }
                })()}
              </SearchSyncToolbar>
              <Divider />
              <Box sx={{ py: 0, px: 3 }}>
                {staticEntityDetails ? (
                  <Box
                    sx={{
                      ...(() => {
                        if (!showForm) {
                          return {
                            py: 2,
                          };
                        }
                        return {
                          pt: 2,
                        };
                      })(),
                    }}
                  >
                    {staticEntityDetails}
                  </Box>
                ) : null}
              </Box>
              {(() => {
                if (showForm) {
                  return (
                    <Box
                      sx={{
                        overflowY: 'auto',
                        py: 2,
                        px: 3,
                        flex: 1,
                        position: 'relative',
                      }}
                    >
                      {(() => {
                        if (submitted && successMessage) {
                          return (
                            <Alert
                              variant="filled"
                              severity="success"
                              onClose={onClose}
                            >
                              {successMessage}
                            </Alert>
                          );
                        }
                        return typeof children === 'function'
                          ? children({
                              isSubmitting,
                              values,
                              isValid,
                              ...rest,
                            })
                          : children;
                      })()}
                      {errorMessage ? (
                        <Box sx={{ pt: 2, position: 'sticky', bottom: 0 }}>
                          <ErrorAlert message={errorMessage} />
                        </Box>
                      ) : null}
                    </Box>
                  );
                }
              })()}
              <Divider />
              <Grid
                container
                spacing={2}
                sx={{ py: 2, px: 3, flexDirection: 'row-reverse' }}
              >
                {editMode
                  ? null
                  : (() => {
                      if (viewModeTools) {
                        const toolsList = Children.toArray(viewModeTools);
                        return toolsList.map((tool, index) => {
                          return (
                            <Grid item key={index} sx={{ minWidth: 0 }}>
                              {tool}
                            </Grid>
                          );
                        });
                      }
                      return (
                        <Grid item>
                          <Button
                            variant="contained"
                            onClick={() => {
                              onClickEdit && onClickEdit();
                            }}
                          >
                            Edit
                          </Button>
                        </Grid>
                      );
                    })()}
                {submitted || !showForm ? (
                  <Grid item>
                    <Button
                      onClick={onClose}
                      variant="outlined"
                      color="inherit"
                    >
                      Close
                    </Button>
                  </Grid>
                ) : (
                  <>
                    <Grid item>
                      <LoadingButton
                        loading={loading || isSubmitting}
                        variant="contained"
                        type="submit"
                        disabled={(() => {
                          if (lockSubmitIfNoChange) {
                            return !formHasChanges;
                          }
                          if (lockSubmitIfFormInvalid) {
                            return !isValid;
                          }
                        })()}
                        {...SubmitButtonPropsRest}
                      >
                        {submitButtonText}
                      </LoadingButton>
                    </Grid>
                    {!isSubmitting ? (
                      <Grid item>
                        <Button
                          onClick={onClose}
                          variant="outlined"
                          color="inherit"
                          sx={{
                            color: alpha(palette.text.primary, 0.5),
                          }}
                        >
                          Cancel
                        </Button>
                      </Grid>
                    ) : null}
                  </>
                )}
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </Card>
  );

  return (
    <Modal
      disableEscapeKeyDown
      disableAutoFocus
      {...rest}
      ref={ref}
      className={clsx(classes.root)}
      open={open}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick' && onClose) {
          onClose();
        }
      }}
      sx={{
        display: 'flex',
        p: 4,
        justifyContent: 'center',
        alignItems: 'center',
        ...(components?.MuiModalForm?.styleOverrides?.root as any),
        ...sx,
      }}
    >
      {(() => {
        if (getModalElement) {
          return getModalElement(modalElement);
        }
        return modalElement;
      })()}
    </Modal>
  );
};

export const ModalForm = forwardRef(BaseModalForm) as <
  Values extends FormikValues
>(
  p: ModalFormProps<Values> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default ModalForm;
