import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  CircularProgress,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Grid,
  GridProps,
  IconButton,
  Tooltip,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import clsx from 'clsx';
import { Form, Formik } from 'formik';
import { omit } from 'lodash';
import {
  ReactNode,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Yup from 'yup';

import { useLoadingContext } from '../contexts/LoadingContext';
import { useUpdate } from '../hooks/Utils';
import { ExoticDataType } from '../interfaces/Utils';
import FormikCurrencyInputField from './FormikInputFields/FormikCurrencyInputField';
import FormikDateInputField from './FormikInputFields/FormikDateInputField';
import FormikNumberInputField from './FormikInputFields/FormikNumberInputField';
import FormikPercentageInputField from './FormikInputFields/FormikPercentageInputField';
import FormikPhoneNumberInputField from './FormikInputFields/FormikPhoneNumberInputField';
import FormikTextField from './FormikInputFields/FormikTextField';
import LoadingTypography, { LoadingTypographyProps } from './LoadingTypography';

export interface FieldValueClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FieldValueClassKey = keyof FieldValueClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFieldValue: FieldValueProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFieldValue: keyof FieldValueClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFieldValue?: {
      defaultProps?: ComponentsProps['MuiFieldValue'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFieldValue'];
      variants?: ComponentsVariants['MuiFieldValue'];
    };
  }
}

export interface FieldValueProps<T extends ReactNode = ReactNode>
  extends LoadingTypographyProps {
  icon?: ReactNode;
  endIcon?: ReactNode;
  IconContainerProps?: Partial<GridProps>;
  EndIconContainerProps?: Partial<GridProps>;
  ContainerGridProps?: Partial<GridProps>;
  editable?: boolean;
  editableValue?: string | boolean | number;
  fieldValueEditor?: (value: T) => any;
  onFieldValueUpdated?: () => void;
  onCancelEdit?: () => void;
  onChangeEditMode?: (editMode: boolean) => void;
  type?: ExoticDataType;
  validationRules?: Yup.BaseSchema;
  editField?: ReactNode;
  editMode?: boolean;
  children?: T;
}

export function getFieldValueUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFieldValue', slot);
}

export const fieldValueClasses: FieldValueClasses = generateUtilityClasses(
  'MuiFieldValue',
  ['root']
);

const slots = {
  root: ['root'],
};

export const FieldValue = forwardRef<HTMLElement, FieldValueProps>(
  function FieldValue(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiFieldValue' });
    const {
      icon,
      endIcon,
      IconContainerProps = {},
      EndIconContainerProps = {},
      ContainerGridProps = {},
      className,
      children: valueProp,
      fieldValueEditor,
      onFieldValueUpdated,
      onCancelEdit,
      type = 'string',
      editable = false,
      validationRules = Yup.string(),
      editField,
      editMode: editModeProp,
      onChangeEditMode,
      sx,
      ...rest
    } = props;

    let { editableValue } = props;

    const classes = composeClasses(
      slots,
      getFieldValueUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );
    const { loading, errorMessage } = useLoadingContext();

    const { sx: IconContainerPropsSx, ...IconContainerPropsRest } =
      IconContainerProps;
    const { sx: EndIconContainerPropsSx, ...EndIconContainerPropsRest } =
      EndIconContainerProps;
    const { sx: ContainerGridPropsSx, ...ContainerGridPropsRest } =
      ContainerGridProps;

    if (
      editableValue === undefined &&
      ['string', 'boolean', 'number'].includes(typeof valueProp)
    ) {
      editableValue = valueProp as any;
    }

    // Refs
    const isComponentMountedRef = useRef(true);
    const anchorRef = useRef<HTMLDivElement>(null);
    const onChangeEditModeRef = useRef(onChangeEditMode);
    const onFieldValueUpdatedRef = useRef(onFieldValueUpdated);
    useEffect(() => {
      onChangeEditModeRef.current = onChangeEditMode;
      onFieldValueUpdatedRef.current = onFieldValueUpdated;
    }, [onChangeEditMode, onFieldValueUpdated]);

    const { palette, components } = useTheme();
    const [editMode, setEditMode] = useState(editModeProp ?? false);
    const {
      update,
      updating,
      updated,
      reset: resetUpdateState,
    } = useUpdate(fieldValueEditor!);

    useEffect(() => {
      onChangeEditModeRef.current && onChangeEditModeRef.current(editMode);
    }, [editMode]);

    useEffect(() => {
      if (editModeProp != null) {
        setEditMode(editModeProp);
      }
    }, [editModeProp]);

    useEffect(() => {
      if (updated && isComponentMountedRef.current) {
        (async () => {
          onFieldValueUpdatedRef.current &&
            (await onFieldValueUpdatedRef.current());
          setEditMode(false);
          resetUpdateState();
        })();
      }
    }, [resetUpdateState, updated]);

    useEffect(() => {
      isComponentMountedRef.current = true;
      return () => {
        isComponentMountedRef.current = false;
      };
    }, []);

    if (loading || errorMessage) {
      return <LoadingTypography>{valueProp}</LoadingTypography>;
    }

    const value = (() => {
      if (editable) {
        if (editMode) {
          return (
            <Formik
              validationSchema={Yup.object({
                value: validationRules,
              })}
              initialValues={{
                value: editableValue || '',
              }}
              onSubmit={async ({ value }) => {
                if (fieldValueEditor) {
                  update(value);
                }
              }}
            >
              {({ submitForm, touched }) => {
                return (
                  <Form noValidate>
                    <Box>
                      {(() => {
                        if (editField) {
                          return editField;
                        }
                        switch (type) {
                          case 'number':
                            return (
                              <FormikNumberInputField
                                name="value"
                                placeholder="Enter a value"
                              />
                            );
                          case 'percentage':
                            return (
                              <FormikPercentageInputField
                                name="value"
                                placeholder="Enter a value"
                              />
                            );
                          case 'currency':
                            return (
                              <FormikCurrencyInputField
                                name="value"
                                placeholder="Enter a value"
                              />
                            );
                          case 'phoneNumber':
                            return (
                              <FormikPhoneNumberInputField
                                name="value"
                                placeholder="Enter a value"
                              />
                            );
                          case 'date':
                            return (
                              <FormikDateInputField
                                name="value"
                                placeholder="Enter a value"
                              />
                            );
                          default:
                            return (
                              <FormikTextField
                                name="value"
                                placeholder="Enter a value"
                              />
                            );
                        }
                      })()}
                      <Popper
                        open
                        anchorEl={anchorRef.current}
                        transition
                        placement="bottom-end"
                        sx={{
                          zIndex: 9999,
                        }}
                      >
                        {({ TransitionProps }) => {
                          return (
                            <Grow {...TransitionProps}>
                              <Grid
                                container
                                sx={{
                                  py: 0.5,
                                  gap: 0.5,
                                  justifyContent: 'end',
                                  svg: {
                                    fontSize: 16,
                                  },
                                }}
                              >
                                <Grid item>
                                  {updating ? null : (
                                    <Tooltip title="Cancel">
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          setEditMode(false);
                                          onCancelEdit && onCancelEdit();
                                        }}
                                        sx={{
                                          p: 0.4,
                                          '&,&:hover': {
                                            bgcolor: palette.error.main,
                                            color: palette.getContrastText(
                                              palette.error.main
                                            ),
                                          },
                                        }}
                                      >
                                        <CloseIcon />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Grid>
                                <Grid item>
                                  {updating || updated ? (
                                    <IconButton
                                      disabled
                                      sx={{
                                        p: 0.4,
                                      }}
                                    >
                                      <CircularProgress
                                        color="inherit"
                                        size={16}
                                      />
                                    </IconButton>
                                  ) : (
                                    <Tooltip title="Update">
                                      <IconButton
                                        size="small"
                                        onClick={() => submitForm()}
                                        sx={{
                                          p: 0.4,
                                          '&,&:hover': {
                                            bgcolor: palette.success.main,
                                            color: palette.getContrastText(
                                              palette.success.main
                                            ),
                                          },
                                        }}
                                        disabled={!touched}
                                      >
                                        <CheckIcon />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Grid>
                              </Grid>
                            </Grow>
                          );
                        }}
                      </Popper>
                    </Box>
                  </Form>
                );
              }}
            </Formik>
          );
        }
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {isValidElement(valueProp) ? valueProp : <>{valueProp}</>}
            <Tooltip title="Edit">
              <EditIcon
                sx={{
                  cursor: 'pointer',
                  fontSize: 18,
                  opacity: 0.5,
                }}
                onClick={() => setEditMode(true)}
              />
            </Tooltip>
          </Box>
        );
      }
      return valueProp;
    })();

    return (
      <Grid
        {...ContainerGridPropsRest}
        container
        className={clsx(classes.root, className)}
        sx={{
          gap: 1,
          ...(() => {
            if (!editMode) {
              return {
                width: 'auto',
                maxWidth: '100%',
              };
            }
          })(),
          ...ContainerGridPropsSx,
        }}
      >
        {!editMode && icon ? (
          <Grid
            {...IconContainerPropsRest}
            item
            sx={{
              display: 'flex',
              maxWidth: 20,
              height: 20,
              justifyContent: 'center',
              svg: {
                fontSize: 20,
              },
              ...IconContainerPropsSx,
            }}
          >
            {icon}
          </Grid>
        ) : null}
        <Grid
          ref={anchorRef}
          item
          xs
          sx={{
            minWidth: 0,
            maxWidth: 'none !important',
          }}
        >
          <LoadingTypography
            ref={ref as any}
            className={clsx(classes.root)}
            variant="body2"
            {...{ component: 'div' }}
            {...omit(rest, 'editableValue')}
            sx={{
              wordBreak: 'break-word',
              maxWidth: '100%',
              lineHeight: 'inherit',
              ...((components?.MuiFieldValue?.styleOverrides?.root as any) ||
                {}),
              ...sx,
            }}
          >
            {value ?? '-'}
          </LoadingTypography>
        </Grid>
        {!editMode && endIcon ? (
          <Grid
            {...EndIconContainerPropsRest}
            item
            sx={{
              display: 'flex',
              maxWidth: 20,
              height: 20,
              justifyContent: 'center',
              svg: {
                fontSize: 20,
              },
              ...EndIconContainerPropsSx,
            }}
          >
            {endIcon}
          </Grid>
        ) : null}
      </Grid>
    );
  }
);

export default FieldValue;
