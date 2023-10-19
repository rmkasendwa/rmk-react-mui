import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { forwardRef } from 'react';

import { useAggregatedFormikContext } from '../../hooks/Formik';
import SwitchInputField, {
  SwitchInputFieldProps,
} from '../InputFields/SwitchInputField';

export interface FormikSwitchInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FormikSwitchInputFieldClassKey =
  keyof FormikSwitchInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFormikSwitchInputField: FormikSwitchInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFormikSwitchInputField: keyof FormikSwitchInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFormikSwitchInputField?: {
      defaultProps?: ComponentsProps['MuiFormikSwitchInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFormikSwitchInputField'];
      variants?: ComponentsVariants['MuiFormikSwitchInputField'];
    };
  }
}
//#endregion

export const getFormikSwitchInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFormikSwitchInputField', slot);
};

const slots: Record<
  FormikSwitchInputFieldClassKey,
  [FormikSwitchInputFieldClassKey]
> = {
  root: ['root'],
};

export const formikRadioButtonsFieldClasses: FormikSwitchInputFieldClasses =
  generateUtilityClasses(
    'MuiFormikSwitchInputField',
    Object.keys(slots) as FormikSwitchInputFieldClassKey[]
  );

export interface FormikSwitchInputFieldProps extends SwitchInputFieldProps {}

export const FormikSwitchInputField = forwardRef<
  HTMLDivElement,
  FormikSwitchInputFieldProps
>(function FormikSwitchInputField(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiFormikSwitchInputField',
  });
  const { className, id, name, value: valueProp, ...rest } = props;

  const classes = composeClasses(
    slots,
    getFormikSwitchInputFieldUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { value = false, setFieldValue } = useAggregatedFormikContext({
    value: valueProp,
    name,
  });

  return (
    <SwitchInputField
      ref={ref}
      {...rest}
      className={clsx(classes.root)}
      {...{ name, value }}
      checked={Boolean(value)}
      onChange={(event) => {
        if (name || id) {
          setFieldValue(String(name || id), event.target.checked);
        }
      }}
    />
  );
});

export default FormikSwitchInputField;
