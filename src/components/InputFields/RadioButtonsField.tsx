import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  FormControlLabel,
  FormControlLabelProps,
  FormControlProps,
  FormHelperText,
  Radio,
  RadioProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import RadioGroup, { RadioGroupProps } from '@mui/material/RadioGroup';
import clsx from 'clsx';
import { ReactNode, forwardRef } from 'react';

import { DropdownOption } from '../../models/Utils';
import FieldLabel, { FieldLabelProps } from '../FieldLabel';

export interface RadioButtonsFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type RadioButtonsFieldClassKey = keyof RadioButtonsFieldClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiRadioButtonsField: RadioButtonsFieldProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiRadioButtonsField: keyof RadioButtonsFieldClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiRadioButtonsField?: {
      defaultProps?: ComponentsProps['MuiRadioButtonsField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiRadioButtonsField'];
      variants?: ComponentsVariants['MuiRadioButtonsField'];
    };
  }
}

export interface RadioButtonsFieldProps
  extends Partial<Omit<FormControlProps, 'id' | 'name' | 'onChange' | 'value'>>,
    Partial<Pick<RadioGroupProps, 'id' | 'name' | 'onChange' | 'value'>> {
  label?: ReactNode;
  RadioGroupProps?: Partial<RadioGroupProps>;
  FieldLabelProps?: Partial<FieldLabelProps>;
  FormControlLabelProps?: Partial<FormControlLabelProps>;
  RadioProps?: Partial<RadioProps>;
  helperText?: ReactNode;
  options: (DropdownOption | string)[];
}

export function getRadioButtonsFieldUtilityClass(slot: string): string {
  return generateUtilityClass('MuiRadioButtonsField', slot);
}

export const radioButtonsFieldClasses: RadioButtonsFieldClasses =
  generateUtilityClasses('MuiRadioButtonsField', ['root']);

const slots = {
  root: ['root'],
};

export const RadioButtonsField = forwardRef<
  HTMLDivElement,
  RadioButtonsFieldProps
>(function RadioButtonsField(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiRadioButtonsField' });
  const {
    className,
    FieldLabelProps = {},
    RadioProps = {},
    FormControlLabelProps = {},
    RadioGroupProps = {},
    required,
    id,
    name,
    value,
    onChange,
    helperText,
    label,
    error,
    options,
    disabled,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getRadioButtonsFieldUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { ...RadioGroupPropsRest } = RadioGroupProps;
  const { ...FieldLabelPropsRest } = FieldLabelProps;
  const { ...FormControlLabelPropsRest } = FormControlLabelProps;
  const { sx: RadioPropsSx, ...RadioPropsRest } = RadioProps;

  return (
    <FormControl
      ref={ref}
      {...{ disabled }}
      {...rest}
      className={clsx(classes.root)}
    >
      {label ? (
        <FieldLabel {...{ required, disabled }} {...FieldLabelPropsRest}>
          {label}
        </FieldLabel>
      ) : null}
      <RadioGroup {...RadioGroupPropsRest} {...{ id, name, value, onChange }}>
        {options.map((option) => {
          const { value, label } = ((): DropdownOption => {
            if (typeof option === 'string') {
              return {
                value: option,
                label: option,
              };
            }
            return option;
          })();
          return (
            <FormControlLabel
              {...FormControlLabelPropsRest}
              key={value}
              control={
                <Radio
                  color="default"
                  {...RadioPropsRest}
                  sx={{
                    p: 0.8,
                    [`&.Mui-disabled`]: {
                      color: 'text.disabled',
                    },
                    ...RadioPropsSx,
                  }}
                />
              }
              {...{ value, label }}
            />
          );
        })}
      </RadioGroup>
      {helperText ? (
        <FormHelperText {...{ error }}>{helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
});

export default RadioButtonsField;
