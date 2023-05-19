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

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFieldValueDisplay: FieldValueDisplayProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFieldValueDisplay: keyof FieldValueDisplayClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFieldValueDisplay?: {
      defaultProps?: ComponentsProps['MuiFieldValueDisplay'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFieldValueDisplay'];
      variants?: ComponentsVariants['MuiFieldValueDisplay'];
    };
  }
}

export interface FieldValueDisplayProps<
  FieldValue extends ReactNode = ReactNode
> extends Partial<BoxProps>,
    Pick<FieldLabelProps, 'required' | 'labelSuffix' | 'helpTip'>,
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
}

export function getFieldValueDisplayUtilityClass(slot: string): string {
  return generateUtilityClass('MuiFieldValueDisplay', slot);
}

export const fieldValueDisplayClasses: FieldValueDisplayClasses =
  generateUtilityClasses('MuiFieldValueDisplay', [
    'root',
    'label',
    'description',
    'value',
  ]);

const slots = {
  root: ['root'],
  label: ['label'],
  description: ['description'],
  value: ['value'],
};

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
    sx,
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
    ContainerGridProps: FieldValuePropsContainerGripProps = {},
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

  return (
    <Box
      ref={ref}
      className={clsx(classes.root, className)}
      {...rest}
      sx={{
        ...(components?.MuiFieldValueDisplay?.styleOverrides?.root as any),
        ...sx,
      }}
    >
      {displayLabel && (
        <FieldLabel
          className={clsx(classes.label, LabelPropsClassName)}
          {...{ enableLoadingState, required, labelSuffix, helpTip }}
          {...LabelPropsRest}
          sx={{
            ...(components?.MuiFieldValueDisplay?.styleOverrides?.label as any),
            ...LabelPropsSx,
          }}
        >
          {displayLabel}
        </FieldLabel>
      )}
      {description && (
        <FieldLabel
          className={clsx(classes.description, DescriptionPropsClassName)}
          {...{ enableLoadingState }}
          {...DescriptionPropsRest}
          sx={{
            ...(components?.MuiFieldValueDisplay?.styleOverrides
              ?.description as any),
            ...DescriptionPropsSx,
          }}
        >
          {description}
        </FieldLabel>
      )}
      <FieldValue
        className={clsx(classes.value, ValuePropsClassName)}
        {...({ enableLoadingState } as any)}
        {...FieldValuePropsRest}
        {...{
          editable,
          onCancelEdit,
          type,
          validationRules,
          editField,
          editMode,
          editableValue,
          fieldValueEditor,
          onFieldValueUpdated,
        }}
        onChangeEditMode={(editMode) => {
          setEditMode(editMode);
        }}
        ContainerGridProps={{
          ...FieldValuePropsContainerGripPropsRest,
          sx: {
            mt: 0.5,
            ...FieldValuePropsContainerGripPropsSx,
          },
        }}
        sx={{
          ...(components?.MuiFieldValueDisplay?.styleOverrides?.value as any),
          ...FieldValuePropsSx,
        }}
      >
        {value}
      </FieldValue>
    </Box>
  );
};

export const FieldValueDisplay = forwardRef(BaseFieldValueDisplay) as <
  FieldValue extends ReactNode = ReactNode
>(
  p: FieldValueDisplayProps<FieldValue> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default FieldValueDisplay;
