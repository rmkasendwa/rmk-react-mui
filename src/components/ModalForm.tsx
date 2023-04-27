import { diff } from '@infinite-debugger/rmk-utils/data';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  ButtonProps,
  Card,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Grid,
  GridProps,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { FormikValues } from 'formik';
import { isEmpty, pick } from 'lodash';
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
import { formikErrorFieldHighlighterClasses } from './FormikErrorFieldHighlighter';
import FormikForm, {
  FormikFormFunctionChildren,
  FormikFormProps,
} from './FormikForm';
import ModalPopup, { ModalPopupProps } from './ModalPopup';
import SearchSyncToolbar from './SearchSyncToolbar';

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
> = FormikFormFunctionChildren<Values, ExtraProps>;

export interface ModalFormProps<Values extends FormikValues = any>
  extends Omit<ModalPopupProps, 'children' | 'onSubmit'>,
    Pick<
      FormikFormProps<Values>,
      | 'validationSchema'
      | 'initialValues'
      | 'onSubmit'
      | 'children'
      | 'FormikProps'
    > {
  successMessage?: string;
  submitted?: boolean;
  submitButtonText?: string;
  staticEntityDetails?: ReactNode;
  editMode?: boolean;
  showEditButton?: boolean;
  showFormActionButtons?: boolean;
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
  onSubmitSuccess?: () => void;
  onClickEdit?: () => void;
  SubmitButtonProps?: Partial<LoadingButtonProps>;
  ActionButtonProps?: Partial<ButtonProps>;
  ActionButtonAreaProps?: Partial<GridProps>;
  editableFields?: (keyof Values)[];
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
  ref: Ref<HTMLDivElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiModalForm' });
  const {
    className,
    initialValues,
    validationSchema,
    FormikProps,
    children,
    errorMessage,
    successMessage,
    onSubmit,
    onSubmitSuccess,
    title,
    submitted = false,
    submitButtonText = 'Submit',
    onClose,
    staticEntityDetails,
    editMode = true,
    showEditButton = true,
    showFormActionButtons = true,
    showForm = true,
    onClickEdit,
    viewModeTools,
    lockSubmitIfNoChange = true,
    lockSubmitIfFormInvalid = false,
    CardProps = {},
    CardBodyProps = {},
    SubmitButtonProps = {},
    ActionButtonProps = {},
    ActionButtonAreaProps = {},
    SearchSyncToolbarProps = {},
    showCloseIconButton = true,
    showCloseActionButton = true,
    loading,
    actionButtons,
    CloseActionButtonProps = {},
    editableFields,
    placement = 'center',
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

  const { palette, spacing } = useTheme();

  const { sx: ActionButtonPropsSx, ...ActionButtonPropsRest } =
    ActionButtonProps;
  const { sx: ActionButtonAreaPropsSx, ...ActionButtonAreaPropsRest } =
    ActionButtonAreaProps;

  const { ...SubmitButtonPropsRest } = SubmitButtonProps;
  const { sx: SearchSyncToolbarPropsSx, ...SearchSyncToolbarPropsRest } =
    SearchSyncToolbarProps;
  const { sx: CardPropsSx, ...CardPropsRest } = CardProps;
  const {
    children: CloseActionButtonPropsChildren,
    sx: CloseActionButtonPropsSx,
    ...CloseActionButtonPropsRest
  } = CloseActionButtonProps;
  const { sx: CardBodyPropsSx, ...CardBodyPropsRest } = CardBodyProps;

  const { CardProps: placementCardProps = {} } = (() => {
    const props: Partial<ModalPopupProps> = {};
    switch (placement) {
      case 'right':
      case 'left':
        props.CardProps = {
          ...CardPropsRest,
          sx: {
            maxWidth: 600,
            ...CardPropsSx,
            borderRadius: 0,
            height: '100%',
            maxHeight: 'none',
          },
        };
        break;
    }
    return props;
  })();

  const { sx: placementCardPropsSx, ...placementCardPropsRest } =
    placementCardProps;

  // Refs
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
      {...(placementCardPropsRest as any)}
      {...CardPropsRest}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 640,
        maxHeight: '80%',
        ...placementCardPropsSx,
        ...CardPropsSx,
        [`form, .${formikErrorFieldHighlighterClasses.root}`]: {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        },
      }}
    >
      <FormikForm
        {...{ initialValues, validationSchema, onSubmit, FormikProps }}
        enableReinitialize
      >
        {({ isSubmitting, values, isValid, ...rest }) => {
          const formHasChanges = !isEmpty(
            (() => {
              if (editableFields && editableFields.length > 0) {
                return diff(
                  pick(values, editableFields),
                  pick(initialValues, editableFields)
                );
              }
              return diff(values, initialValues);
            })()
          );
          return (
            <>
              <SearchSyncToolbar
                hasSearchTool={false}
                hasSyncTool={false}
                {...SearchSyncToolbarPropsRest}
                title={title}
                {...(() => {
                  if (showCloseIconButton && !isSubmitting) {
                    return {
                      postSyncButtonTools: [
                        {
                          type: 'icon-button',
                          icon: <CloseIcon />,
                          onClick: onClose,
                        },
                      ] as NonNullable<
                        typeof SearchSyncToolbarPropsRest.postSyncButtonTools
                      >,
                    };
                  }
                })()}
                sx={{
                  pr: `${spacing(2)} !important`,
                  ...SearchSyncToolbarPropsSx,
                }}
              />
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
                      {...CardBodyPropsRest}
                      sx={{
                        overflowY: 'auto',
                        py: 2,
                        px: 3,
                        flex: 1,
                        position: 'relative',
                        ...CardBodyPropsSx,
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
                {...ActionButtonAreaPropsRest}
                sx={{
                  py: 2,
                  px: 3,
                  flexDirection: 'row-reverse',
                  ...ActionButtonAreaPropsSx,
                }}
              >
                {(() => {
                  if (showFormActionButtons) {
                    return (
                      <>
                        {editMode
                          ? (() => {
                              if (submitted || !showForm) {
                                if (showCloseActionButton) {
                                  return (
                                    <Grid item>
                                      <Button
                                        variant="text"
                                        color="inherit"
                                        {...ActionButtonPropsRest}
                                        onClick={onClose}
                                        sx={ActionButtonPropsSx}
                                      >
                                        Close
                                      </Button>
                                    </Grid>
                                  );
                                }
                              } else {
                                return (
                                  <>
                                    <Grid item>
                                      <LoadingButton
                                        variant="contained"
                                        {...ActionButtonPropsRest}
                                        {...SubmitButtonPropsRest}
                                        type="submit"
                                        loading={loading || isSubmitting}
                                        disabled={(() => {
                                          if (lockSubmitIfNoChange) {
                                            return !formHasChanges;
                                          }
                                          if (lockSubmitIfFormInvalid) {
                                            return !isValid;
                                          }
                                        })()}
                                        sx={ActionButtonPropsSx}
                                      >
                                        {submitButtonText}
                                      </LoadingButton>
                                    </Grid>
                                    {!isSubmitting ? (
                                      <Grid item>
                                        <Button
                                          variant="text"
                                          color="inherit"
                                          {...ActionButtonPropsRest}
                                          onClick={onClose}
                                          sx={{
                                            color: alpha(
                                              palette.text.primary,
                                              0.5
                                            ),
                                            ...ActionButtonPropsSx,
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </Grid>
                                    ) : null}
                                  </>
                                );
                              }
                            })()
                          : (() => {
                              return (
                                <>
                                  {(() => {
                                    if (showEditButton) {
                                      return (
                                        <Grid item>
                                          <Button
                                            variant="contained"
                                            {...ActionButtonPropsRest}
                                            onClick={() => {
                                              onClickEdit && onClickEdit();
                                            }}
                                            sx={ActionButtonPropsSx}
                                          >
                                            Edit
                                          </Button>
                                        </Grid>
                                      );
                                    }
                                  })()}
                                  {(() => {
                                    if (viewModeTools) {
                                      return Children.toArray(
                                        viewModeTools
                                      ).map((tool, index) => {
                                        return (
                                          <Grid
                                            item
                                            key={index}
                                            sx={{ minWidth: 0 }}
                                          >
                                            {tool}
                                          </Grid>
                                        );
                                      });
                                    }
                                  })()}
                                  {(() => {
                                    if (showCloseActionButton) {
                                      return (
                                        <Grid item>
                                          <Button
                                            variant="text"
                                            color="inherit"
                                            {...ActionButtonPropsRest}
                                            onClick={onClose}
                                            sx={ActionButtonPropsSx}
                                          >
                                            Close
                                          </Button>
                                        </Grid>
                                      );
                                    }
                                  })()}
                                </>
                              );
                            })()}
                      </>
                    );
                  }
                  return (
                    <>
                      {(() => {
                        if (actionButtons) {
                          return Children.toArray(actionButtons).map(
                            (tool, index) => {
                              return (
                                <Grid item key={index} sx={{ minWidth: 0 }}>
                                  {tool}
                                </Grid>
                              );
                            }
                          );
                        }
                      })()}
                      {(() => {
                        if (showCloseActionButton) {
                          return (
                            <Grid item>
                              <Button
                                variant="text"
                                color="inherit"
                                {...ActionButtonPropsRest}
                                {...CloseActionButtonPropsRest}
                                onClick={onClose}
                                sx={
                                  {
                                    color: alpha(palette.text.primary, 0.5),
                                    ...ActionButtonPropsSx,
                                    ...CloseActionButtonPropsSx,
                                  } as any
                                }
                              >
                                {CloseActionButtonPropsChildren ?? 'Close'}
                              </Button>
                            </Grid>
                          );
                        }
                      })()}
                    </>
                  );
                })()}
              </Grid>
            </>
          );
        }}
      </FormikForm>
    </Card>
  );

  return (
    <ModalPopup
      {...rest}
      {...{ modalElement, title, placement }}
      ref={ref}
      className={clsx(classes.root)}
    />
  );
};

export const ModalForm = forwardRef(BaseModalForm) as <
  Values extends FormikValues
>(
  p: ModalFormProps<Values> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default ModalForm;
