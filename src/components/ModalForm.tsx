import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  ButtonProps,
  Card,
  CardProps,
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
import { Children, FC, ReactNode, useEffect, useRef, useState } from 'react';

import { diff } from '../utils/data';
import ErrorAlert from './ErrorAlert';
import ErrorFieldHighlighter from './ErrorFieldHighlighter';
import SearchSyncToolbar from './SearchSyncToolbar';

export interface ModalFormClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type ModalFormClassKey = keyof ModalFormClasses;

export function getModalFormUtilityClass(slot: string): string {
  return generateUtilityClass('MuiModalForm', slot);
}

export const modalFormClasses: ModalFormClasses = generateUtilityClasses(
  'MuiModalForm',
  ['root']
);

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiModalForm: ModalFormProps;
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

const useUtilityClasses = (ownerState: any) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getModalFormUtilityClass, classes);
};

export interface ModalFormProps<Values extends FormikValues = FormikValues>
  extends ButtonProps {
  initialValues: Values;
  validationSchema: any;
  title: string;
  children: ((props: FormikProps<Values>) => ReactNode) | ReactNode;
  errorMessage?: string;
  successMessage?: string;
  submitted?: boolean;
  submitButtonText?: string;
  open: boolean;
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
  onClose?: () => void;
  onClickEdit?: () => void;
  CardProps?: Partial<CardProps>;
  SubmitButtonProps?: Partial<LoadingButtonProps>;
  FormikProps?: Partial<FormikConfig<Values>>;
  loading?: boolean;
}

export const ModalForm: FC<ModalFormProps> = (inProps) => {
  const props = useThemeProps({ props: inProps, name: 'MuiModalForm' });
  const {
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
    loading,
  } = props;

  const classes = useUtilityClasses({
    ...props,
  });

  const { sx: cardPropsSx, ...cardPropsRest } = CardProps;
  const { ...submitButtonPropsRest } = SubmitButtonProps;

  const onSubmitSuccessRef = useRef(onSubmitSuccess);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onSubmitSuccessRef.current = onSubmitSuccess;
    onCloseRef.current = onClose;
  }, [onClose, onSubmitSuccess]);

  const { spacing, palette } = useTheme();
  const [detailsContainerElement, setDetailsContainerElement] =
    useState<HTMLDivElement | null>(null);
  const [detailsContainerHeight, setDetailsContainerHeight] = useState(0);

  useEffect(() => {
    if (detailsContainerElement) {
      const windowResizeEventCallback = () => {
        setDetailsContainerHeight(detailsContainerElement.offsetHeight);
      };
      window.addEventListener('resize', windowResizeEventCallback);
      setDetailsContainerHeight(detailsContainerElement.offsetHeight);
      return () => {
        window.removeEventListener('resize', windowResizeEventCallback);
      };
    }
  }, [detailsContainerElement]);

  useEffect(() => {
    if (submitted && !successMessage) {
      onCloseRef.current && onCloseRef.current();
      onSubmitSuccessRef.current && onSubmitSuccessRef.current();
    }
  }, [submitted, successMessage]);

  return (
    <Modal
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
      }}
      disableEscapeKeyDown
      disableAutoFocus
    >
      <Card
        {...cardPropsRest}
        sx={{ maxWidth: 640, width: `100%`, ...cardPropsSx }}
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
                  title={title}
                  hasSearchTool={false}
                  hasSyncTool={false}
                >
                  {!isSubmitting ? (
                    <IconButton onClick={onClose} sx={{ p: 0.5 }}>
                      <CloseIcon />
                    </IconButton>
                  ) : null}
                </SearchSyncToolbar>
                <Divider />
                <Box sx={{ py: 0, px: 3 }}>
                  {staticEntityDetails ? (
                    <Box
                      ref={(detailsContainerElement: HTMLDivElement | null) => {
                        setDetailsContainerElement(detailsContainerElement);
                      }}
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
                          maxHeight: `calc(100vh - 144px - ${spacing(
                            8
                          )} - ${detailsContainerHeight}px)`,
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
                          <Box sx={{ pt: 2 }}>
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
                          {...submitButtonPropsRest}
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
    </Modal>
  );
};

export default ModalForm;
