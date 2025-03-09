import { diff } from '@infinite-debugger/rmk-utils/data';
import CloseIcon from '@mui/icons-material/Close';
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
  Typography,
  alpha,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useMediaQuery,
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
  useState,
} from 'react';

import { Draft, DraftsManager } from '../models/Drafts';
import ErrorAlert from './ErrorAlert';
import { formikErrorFieldHighlighterClasses } from './FormikErrorFieldHighlighter';
import FormikForm, {
  FormikFormFunctionChildren,
  FormikFormProps,
  formikFormClasses,
} from './FormikForm';
import ModalPopup, { ModalPopupProps } from './ModalPopup';
import SearchSyncToolbar from './SearchSyncToolbar';

export interface ModalFormClasses {
  /** Styles applied to the root element. */
  root: string;
  cardRoot: string;
  cardBody: string;
}

export type ModalFormClassKey = keyof ModalFormClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiModalForm: ModalFormProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiModalForm: keyof ModalFormClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiModalForm?: {
      defaultProps?: ComponentsProps['MuiModalForm'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiModalForm'];
      variants?: ComponentsVariants['MuiModalForm'];
    };
  }
}
//#endregion

export const getModalFormUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiModalForm', slot);
};

const slots: Record<ModalFormClassKey, [ModalFormClassKey]> = {
  root: ['root'],
  cardRoot: ['cardRoot'],
  cardBody: ['cardBody'],
};

export const modalFormClasses: ModalFormClasses = generateUtilityClasses(
  'MuiModalForm',
  Object.keys(slots) as ModalFormClassKey[]
);

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
  viewModeTools?: ReactNode[];
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
  SubmitButtonProps?: Partial<ButtonProps>;
  editableFields?: (keyof Values)[];
  draftManager?: DraftsManager;
  draft?: Pick<Draft, 'id' | 'draftMessage' | 'draftUrl'>;
  errorAlertPlacement?: 'top' | 'bottom';
}

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
    onClose: onCloseProp,
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
    actionAreaTools,
    CloseActionButtonProps = {},
    editableFields,
    placement = 'center',
    draftManager,
    draft: draftProp,
    open,
    errorAlertPlacement = 'bottom',
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

  const { palette, breakpoints, spacing } = useTheme();
  const isSmallScreen = useMediaQuery(breakpoints.down('sm'));

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

  //#region Refs
  const onSubmitSuccessRef = useRef(onSubmitSuccess);
  onSubmitSuccessRef.current = onSubmitSuccess;
  const draftManagerRef = useRef(draftManager);
  draftManagerRef.current = draftManager;
  const formHasChangesRef = useRef(false);
  //#endregion

  const [isClosingWithChanges, setIsClosingWithChanges] = useState(false);

  const onClose = ({
    saveDraft = false,
    force = false,
  }: { saveDraft?: boolean; force?: boolean } = {}) => {
    if (formHasChangesRef.current && !isClosingWithChanges && !force) {
      setIsClosingWithChanges(true);
      return;
    }
    if (!saveDraft && draftManagerRef.current && draftProp?.id) {
      const { closeDraft, deleteDraft } = draftManagerRef.current;
      closeDraft(draftProp.id);
      deleteDraft(draftProp.id);
    }
    formHasChangesRef.current = false;
    setIsClosingWithChanges(false);
    onCloseProp && onCloseProp();
  };
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [draftConfig, setDraftConfig] = useState<{
    isDraftLoaded: boolean;
    initialDraft: Values | null;
  }>({ isDraftLoaded: false, initialDraft: null });

  const { isDraftLoaded, initialDraft } = draftConfig;

  useEffect(() => {
    if (draftManagerRef.current && draftProp?.id && open) {
      const { openDraft, findDraft, closeDraft } = draftManagerRef.current;
      openDraft(draftProp.id);
      (async () => {
        const draft = await findDraft(draftProp.id);
        setDraftConfig({
          initialDraft: draft,
          isDraftLoaded: true,
        });
      })();
      return () => {
        closeDraft(draftProp.id);
      };
    }
  }, [draftProp?.id, open]);

  useEffect(() => {
    if (submitted && !successMessage) {
      onCloseRef.current({ force: true });
      onSubmitSuccessRef.current && onSubmitSuccessRef.current();
    }
  }, [submitted, successMessage]);

  const modalElement = (
    <Card
      {...(placementCardPropsRest as any)}
      {...CardPropsRest}
      className={clsx(classes.root, CardPropsRest.className)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 640,
        maxHeight: '80%',
        ...placementCardPropsSx,
        ...CardPropsSx,
        [`.${formikFormClasses.formFieldsWrapper}, .${formikErrorFieldHighlighterClasses.root}`]:
          {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
          },
      }}
    >
      <FormikForm
        {...{ validationSchema, onSubmit, FormikProps }}
        initialValues={initialDraft || initialValues}
        enableReinitialize
        wrapChildrenInForm={editMode}
      >
        {({ values, isValid, ...rest }) => {
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
          formHasChangesRef.current = formHasChanges;

          if (
            draftManager &&
            draftProp?.id &&
            isDraftLoaded &&
            (formHasChanges || initialDraft)
          ) {
            draftManager.updateDraft({
              ...draftProp,
              data: values,
            });
          }

          if (isClosingWithChanges) {
            return (
              <>
                <SearchSyncToolbar
                  hasSearchTool={false}
                  hasSyncTool={false}
                  {...SearchSyncToolbarPropsRest}
                  title="Confirm"
                  postSyncButtonTools={[
                    {
                      type: 'icon-button',
                      label: 'Close',
                      icon: <CloseIcon />,
                      onClick: () => onClose(),
                    },
                  ]}
                  sx={{
                    pr: `${spacing(2)} !important`,
                    ...SearchSyncToolbarPropsSx,
                  }}
                />
                <Divider />
                <Box sx={{ py: 2, px: 3 }}>
                  <Typography variant="body2">
                    Please confirm that you want to close this form. All changes
                    that have been made will be discarded.
                  </Typography>
                </Box>
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
                  <Grid item>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        onClose();
                        rest.resetForm();
                      }}
                    >
                      Close
                    </Button>
                  </Grid>
                  {draftManager && draftProp?.id ? (
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          onClose({ saveDraft: true });
                          rest.resetForm();
                        }}
                      >
                        Save as draft
                      </Button>
                    </Grid>
                  ) : null}
                  <Grid item>
                    <Button
                      variant="text"
                      color="inherit"
                      onClick={() => {
                        setIsClosingWithChanges(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </>
            );
          }

          return (
            <>
              <SearchSyncToolbar
                hasSearchTool={false}
                hasSyncTool={false}
                {...SearchSyncToolbarPropsRest}
                title={title}
                {...(() => {
                  if (showCloseIconButton && !loading) {
                    return {
                      postSyncButtonTools: [
                        {
                          type: 'icon-button',
                          label: 'Close',
                          icon: <CloseIcon />,
                          onClick: () => onClose(),
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
                      className={clsx(
                        classes.cardBody,
                        CardBodyPropsRest.className
                      )}
                      sx={{
                        overflowY: 'auto',
                        py: 2,
                        px: 3,
                        flex: 1,
                        position: 'relative',
                        ...CardBodyPropsSx,
                      }}
                    >
                      {errorMessage && errorAlertPlacement === 'top' ? (
                        <Box
                          sx={{ pb: 2, position: 'sticky', top: 0, zIndex: 5 }}
                        >
                          <ErrorAlert message={errorMessage} />
                        </Box>
                      ) : null}
                      {(() => {
                        if (submitted && !loading && successMessage) {
                          return (
                            <Alert
                              variant="filled"
                              severity="success"
                              onClose={() => {
                                onClose({ force: true });
                                rest.resetForm();
                              }}
                            >
                              {successMessage}
                            </Alert>
                          );
                        }
                        return typeof children === 'function'
                          ? children({
                              values,
                              isValid,
                              formHasChanges,
                              ...rest,
                            })
                          : children;
                      })()}
                      {errorMessage && errorAlertPlacement === 'bottom' ? (
                        <Box
                          sx={{
                            pt: 2,
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 5,
                          }}
                        >
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
                  ...(() => {
                    if (isSmallScreen) {
                      return {
                        py: 1,
                        px: 2,
                      };
                    }
                  })(),
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  ...ActionButtonAreaPropsSx,
                }}
              >
                {(() => {
                  if (showFormActionButtons) {
                    return (
                      <>
                        {editMode
                          ? (() => {
                              if ((submitted || !showForm) && !loading) {
                                if (showCloseActionButton) {
                                  return (
                                    <Grid item>
                                      <Button
                                        variant="text"
                                        color="inherit"
                                        {...ActionButtonPropsRest}
                                        {...CloseActionButtonPropsRest}
                                        onClick={() => onClose()}
                                        sx={
                                          {
                                            color: alpha(
                                              palette.text.primary,
                                              0.5
                                            ),
                                            ...ActionButtonPropsSx,
                                            ...CloseActionButtonPropsSx,
                                          } as any
                                        }
                                      >
                                        {CloseActionButtonPropsChildren ??
                                          'Close'}
                                      </Button>
                                    </Grid>
                                  );
                                }
                              } else {
                                return (
                                  <>
                                    <Grid item>
                                      <Button
                                        variant="contained"
                                        {...ActionButtonPropsRest}
                                        {...SubmitButtonPropsRest}
                                        type="submit"
                                        loading={loading}
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
                                      </Button>
                                    </Grid>
                                    {!loading ? (
                                      <Grid item>
                                        <Button
                                          variant="text"
                                          color="inherit"
                                          {...ActionButtonPropsRest}
                                          onClick={() => onClose()}
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
                                            {...CloseActionButtonPropsRest}
                                            onClick={() => onClose()}
                                            sx={
                                              {
                                                color: alpha(
                                                  palette.text.primary,
                                                  0.5
                                                ),
                                                ...ActionButtonPropsSx,
                                                ...CloseActionButtonPropsSx,
                                              } as any
                                            }
                                          >
                                            {CloseActionButtonPropsChildren ??
                                              'Close'}
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
                          return actionButtons.map((tool, index) => {
                            return (
                              <Grid item key={index} sx={{ minWidth: 0 }}>
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
                                {...CloseActionButtonPropsRest}
                                onClick={() => onClose()}
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
                <Grid item xs />
                {(() => {
                  if (actionAreaTools) {
                    return actionAreaTools.map((tool, index) => {
                      return (
                        <Grid item key={index} sx={{ minWidth: 0 }}>
                          {tool}
                        </Grid>
                      );
                    });
                  }
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
      {...{ modalElement, title, placement, open, onClose }}
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
