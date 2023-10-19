import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  FormControlLabel,
  FormControlLabelProps,
  Switch,
  SwitchProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { ReactNode, forwardRef } from 'react';

import { useLoadingContext } from '../../contexts/LoadingContext';

export interface SwitchInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type SwitchInputFieldClassKey = keyof SwitchInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiSwitchInputField: SwitchInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiSwitchInputField: keyof SwitchInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiSwitchInputField?: {
      defaultProps?: ComponentsProps['MuiSwitchInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiSwitchInputField'];
      variants?: ComponentsVariants['MuiSwitchInputField'];
    };
  }
}
//#endregion

export const getSwitchInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiSwitchInputField', slot);
};

const slots: Record<SwitchInputFieldClassKey, [SwitchInputFieldClassKey]> = {
  root: ['root'],
};

export const switchInputFieldClasses: SwitchInputFieldClasses =
  generateUtilityClasses(
    'MuiSwitchInputField',
    Object.keys(slots) as SwitchInputFieldClassKey[]
  );

export interface SwitchInputFieldProps
  extends Partial<Omit<FormControlLabelProps, 'onChange'>>,
    Pick<SwitchProps, 'checked' | 'onChange'> {
  label: ReactNode;
  SwitchProps?: Partial<SwitchProps>;
  enableLoadingState?: boolean;
}

export const SwitchInputField = forwardRef<any, SwitchInputFieldProps>(
  function SwitchInputField(inProps, ref) {
    const props = useThemeProps({
      props: inProps,
      name: 'MuiSwitchInputField',
    });
    const {
      className,
      checked,
      onChange,
      SwitchProps = {},
      enableLoadingState = true,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getSwitchInputFieldUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const { ...SwitchPropsRest } = SwitchProps;

    const { locked } = useLoadingContext();

    return (
      <FormControlLabel
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        control={
          <Switch
            name="enabled"
            color="success"
            {...SwitchPropsRest}
            {...{ checked, onChange }}
            disabled={enableLoadingState && locked}
          />
        }
        disabled={enableLoadingState && locked}
        componentsProps={{
          ...rest.componentsProps,
          typography: {
            variant: 'body2',
            ...rest.componentsProps?.typography,
          },
        }}
      />
    );
  }
);

export default SwitchInputField;
