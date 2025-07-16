import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useTheme,
  useThemeProps,
} from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import clsx from 'clsx';
import {
  ReactElement,
  ReactNode,
  Ref,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';

import FieldLabel, { FieldLabelProps } from './FieldLabel';
import FieldValue, { FieldValueProps } from './FieldValue';

export interface FieldValueDisplayClasses {
  /** Styles applied to the root element. */
  root: string;
  label: string;
  description: string;
  value: ReactNode;
}

export type FieldValueDisplayClassKey = keyof FieldValueDisplayClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFieldValueDisplay: FieldValueDisplayProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFieldValueDisplay: keyof FieldValueDisplayClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFieldValueDisplay?: {
      defaultProps?: ComponentsProps['MuiFieldValueDisplay'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFieldValueDisplay'];
      variants?: ComponentsVariants['MuiFieldValueDisplay'];
    };
  }
}
//#endregion

export const getFieldValueDisplayUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFieldValueDisplay', slot);
};

const slots: Record<FieldValueDisplayClassKey, [FieldValueDisplayClassKey]> = {
  root: ['root'],
  label: ['label'],
  description: ['description'],
  value: ['value'],
};

export const fieldValueDisplayClasses: FieldValueDisplayClasses =
  generateUtilityClasses(
    'MuiFieldValueDisplay',
    Object.keys(slots) as FieldValueDisplayClassKey[]
  );

export interface FieldValueDisplayProps<
  FieldValue extends ReactNode = ReactNode
> extends Partial<BoxProps>,
    Pick<FieldLabelProps, 'required' | 'labelSuffix' | 'helpTip' | 'disabled'>,
    Pick<
      FieldValueProps<FieldValue>,
      | 'editable'
      | 'onCancelEdit'
      | 'editableValue'
      | 'type'
      | 'validationRules'
      | 'editField'
      | 'editMode'
      | 'onChangeEditMode'
      | 'fieldValueEditor'
      | 'onFieldValueUpdated'
    > {
  label: ReactNode;
  editLabel?: ReactNode;
  description?: ReactNode;
  value?: FieldValue;
  LabelProps?: Partial<FieldLabelProps>;
  DescriptionProps?: Partial<FieldLabelProps>;
  FieldValueProps?: Partial<FieldValueProps>;
  enableLoadingState?: boolean;
  direction?: 'column' | 'row';
  fullWidth?: boolean;
}

export const BaseFieldValueDisplay = <FieldValue extends ReactNode>(
  inProps: FieldValueDisplayProps<FieldValue>,
  ref: Ref<HTMLDivElement>
) => {
  const props = useThemeProps({ props: inProps, name: 'MuiFieldValueDisplay' });
  const {
    label,
    description,
    value,
    LabelProps = {},
    DescriptionProps = {},
    FieldValueProps = {},
    required,
    editable,
    onCancelEdit,
    type,
    validationRules,
    editField,
    editableValue,
    editMode: editModeProp,
    onChangeEditMode,
    fieldValueEditor,
    onFieldValueUpdated,
    className,
    enableLoadingState = true,
    labelSuffix,
    helpTip,
    disabled,
    sx,
    direction = 'column',
    fullWidth,
    ...rest
  } = props;

  let { editLabel } = props;

  const classes = composeClasses(
    slots,
    getFieldValueDisplayUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const {
    className: LabelPropsClassName,
    sx: LabelPropsSx,
    ...LabelPropsRest
  } = LabelProps;
  const {
    className: DescriptionPropsClassName,
    sx: DescriptionPropsSx,
    ...DescriptionPropsRest
  } = DescriptionProps;
  const {
    className: ValuePropsClassName,
    sx: FieldValuePropsSx,
    slotProps: { containerGrid: FieldValuePropsContainerGripProps = {} } = {},
    ...FieldValuePropsRest
  } = FieldValueProps;
  const {
    sx: FieldValuePropsContainerGripPropsSx,
    ...FieldValuePropsContainerGripPropsRest
  } = FieldValuePropsContainerGripProps;

  editLabel ?? (editLabel = label);

  const onChangeEditModeRef = useRef(onChangeEditMode);
  useEffect(() => {
    onChangeEditModeRef.current = onChangeEditMode;
  }, [onChangeEditMode]);

  const { components } = useTheme();

  const [editMode, setEditMode] = useState(editModeProp || false);

  useEffect(() => {
    onChangeEditModeRef.current && onChangeEditModeRef.current(editMode);
  }, [editMode]);

  const displayLabel = (() => {
    if (editable && editMode) {
      return editLabel;
    }
    return label;
  })();

  const labelNode = (() => {
    if (displayLabel) {
      return (
        <FieldLabel
          className={clsx(classes.label, LabelPropsClassName)}
          {...{ enableLoadingState, required, labelSuffix, helpTip, disabled }}
          {...LabelPropsRest}
          {...(() => {
            if (direction === 'row') {
              return {
                slotProps: {
                  containerGrid: {
                    sx: {
                      display: 'inline-flex',
                      width: 'auto',
                    },
                  },
                },
              };
            }
          })()}
          sx={{
            ...(components?.MuiFieldValueDisplay?.styleOverrides?.label as any),
            ...LabelPropsSx,
          }}
        >
          {displayLabel}
        </FieldLabel>
      );
    }
  })();

  const descriptionNode = (() => {
    if (description) {
      return (
        <FieldLabel
          className={clsx(classes.description, DescriptionPropsClassName)}
          {...{ enableLoadingState, disabled }}
          {...DescriptionPropsRest}
          sx={{
            ...(components?.MuiFieldValueDisplay?.styleOverrides
              ?.description as any),
            ...DescriptionPropsSx,
          }}
        >
          {description}
        </FieldLabel>
      );
    }
  })();

  const valueNode = (
    <FieldValue
      className={clsx(classes.value, ValuePropsClassName)}
      {...FieldValuePropsRest}
      {...({
        editable,
        onCancelEdit,
        type,
        validationRules,
        editField,
        editMode,
        editableValue,
        fieldValueEditor,
        onFieldValueUpdated,
        enableLoadingState,
      } as any)}
      onChangeEditMode={(editMode) => {
        setEditMode(editMode);
      }}
      slotProps={{
        containerGrid: {
          ...FieldValuePropsContainerGripPropsRest,
          sx: {
            ...FieldValuePropsContainerGripPropsSx,
          },
        },
      }}
      sx={{
        ...(components?.MuiFieldValueDisplay?.styleOverrides?.value as any),
        ...FieldValuePropsSx,
      }}
    >
      {value}
    </FieldValue>
  );

  return (
    <Box
      ref={ref}
      className={clsx(classes.root, className)}
      {...rest}
      sx={[
        {
          ...(() => {
            if (direction === 'row') {
              return {
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                flexWrap: 'nowrap',
                alignItems: 'start',
              };
            }
          })(),
          ...(() => {
            if (fullWidth) {
              return {
                width: '100%',
              };
            }
          })(),
        },
        components?.MuiFieldValueDisplay?.styleOverrides,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {labelNode}
      {descriptionNode}
      {valueNode}
    </Box>
  );
};

export const FieldValueDisplay = forwardRef(BaseFieldValueDisplay) as <
  FieldValue extends ReactNode = ReactNode
>(
  p: FieldValueDisplayProps<FieldValue> & { ref?: Ref<any> }
) => ReactElement;

export default FieldValueDisplay;
