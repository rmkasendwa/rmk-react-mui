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
import Typography, { TypographyProps } from '@mui/material/Typography';
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

import { ExoticDataType } from '../interfaces/Utils';
import FormikCurrencyInputField from './FormikInputFields/FormikCurrencyInputField';
import FormikDateInputField from './FormikInputFields/FormikDateInputField';
import FormikNumberInputField from './FormikInputFields/FormikNumberInputField';
import FormikPercentageInputField from './FormikInputFields/FormikPercentageInputField';
import FormikPhoneNumberInputField from './FormikInputFields/FormikPhoneNumberInputField';
import FormikTextField from './FormikInputFields/FormikTextField';

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

export interface FieldValueProps extends TypographyProps {
  icon?: ReactNode;
  endIcon?: ReactNode;
  IconContainerProps?: Partial<GridProps>;
  EndIconContainerProps?: Partial<GridProps>;
  ContainerGridProps?: Partial<GridProps>;
  editable?: boolean;
  editableValue?: string;
  onEdit?: (value: string) => void;
  onCancelEdit?: () => void;
  onChangeEditMode?: (editMode: boolean) => void;
  type?: ExoticDataType;
  validationRules?: Yup.BaseSchema;
  editField?: ReactNode;
  editMode?: boolean;
  updating?: boolean;
  updated?: boolean;
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
      onEdit,
      onCancelEdit,
      type = 'string',
      editable = false,
      validationRules = Yup.string(),
      editField,
      editMode: editModeProp,
      updating,
      updated: updatedProp,
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

    const { sx: IconContainerPropsSx, ...IconContainerPropsRest } =
      IconContainerProps;
    const { sx: EndIconContainerPropsSx, ...EndIconContainerPropsRest } =
      EndIconContainerProps;
    const { sx: ContainerGridPropsSx, ...ContainerGridPropsRest } =
      ContainerGridProps;

    if (editableValue == null && typeof valueProp === 'string') {
      editableValue = valueProp;
    }

    // Refs
    const isComponentMountedRef = useRef(true);
    const anchorRef = useRef<HTMLDivElement>(null);
    const onChangeEditModeRef = useRef(onChangeEditMode);
    useEffect(() => {
      onChangeEditModeRef.current = onChangeEditMode;
    }, [onChangeEditMode]);

    const { palette, components } = useTheme();

    const [editMode, setEditMode] = useState(editModeProp || false);
    const [updated, setUpdated] = useState(updatedProp || false);

    useEffect(() => {
      onChangeEditModeRef.current && onChangeEditModeRef.current(editMode);
    }, [editMode]);

    useEffect(() => {
      if (editModeProp != null) {
        setEditMode(editModeProp);
      }
    }, [editModeProp]);

    useEffect(() => {
      if (updatedProp != null) {
        setUpdated(updatedProp);
      }
    }, [updatedProp]);

    useEffect(() => {
      if (updated && isComponentMountedRef.current) {
        setEditMode(false);
        setUpdated(false);
      }
    }, [updated]);

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
                onEdit && (await onEdit(value));
              }}
            >
              {({ isSubmitting }) => {
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
                                  {isSubmitting || updating ? null : (
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
                                  {isSubmitting || updating ? (
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
                                        type="submit"
                                        sx={{
                                          p: 0.4,
                                          '&,&:hover': {
                                            bgcolor: palette.success.main,
                                            color: palette.getContrastText(
                                              palette.success.main
                                            ),
                                          },
                                        }}
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

    useEffect(() => {
      isComponentMountedRef.current = true;
      return () => {
        isComponentMountedRef.current = false;
      };
    }, []);

    return (
      <Grid
        {...ContainerGridPropsRest}
        container
        className={clsx(classes.root, className)}
        sx={{ gap: 1, ...ContainerGridPropsSx }}
      >
        {!editMode && icon ? (
          <Grid
            {...IconContainerPropsRest}
            item
            sx={{
              display: 'flex',
              maxWidth: 24,
              height: 24,
              justifyContent: 'center',
              alignItems: 'center',
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
          <Typography
            ref={ref}
            className={clsx(classes.root)}
            variant="body2"
            component={'div' as any}
            {...omit(rest, 'editableValue')}
            sx={{
              wordBreak: 'break-word',
              whiteSpace: 'pre-line',
              width: '100%',
              lineHeight: 'inherit',
              ...((components?.MuiFieldValue?.styleOverrides?.root as any) ||
                {}),
              ...sx,
            }}
          >
            {value ?? '-'}
          </Typography>
        </Grid>
        {!editMode && endIcon ? (
          <Grid
            {...EndIconContainerPropsRest}
            item
            sx={{
              display: 'flex',
              maxWidth: 24,
              height: 24,
              justifyContent: 'center',
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
