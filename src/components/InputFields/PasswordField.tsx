import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import clsx from 'clsx';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import TextField, { TextFieldProps } from './TextField';

export interface PasswordFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type PasswordFieldClassKey = keyof PasswordFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiPasswordField: PasswordFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiPasswordField: keyof PasswordFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiPasswordField?: {
      defaultProps?: ComponentsProps['MuiPasswordField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiPasswordField'];
      variants?: ComponentsVariants['MuiPasswordField'];
    };
  }
}
//#endregion

export const getPasswordFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiPasswordField', slot);
};

const slots: Record<PasswordFieldClassKey, [PasswordFieldClassKey]> = {
  root: ['root'],
};

export const passwordFieldClasses: PasswordFieldClasses =
  generateUtilityClasses(
    'MuiPasswordField',
    Object.keys(slots) as PasswordFieldClassKey[]
  );

export interface PasswordFieldProps extends TextFieldProps {
  value?: string;
  showPassword?: boolean;
  onChangeShowPassword?: (showPassword: boolean) => void;
}

export const PasswordField = forwardRef<HTMLDivElement, PasswordFieldProps>(
  function PasswordField(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiPasswordField' });
    const {
      className,
      showPassword: showPasswordProp = false,
      name,
      id,
      value,
      disabled,
      onChange: onChangeProp,
      onChangeShowPassword,
      sx,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getPasswordFieldUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const initialRenderRef = useRef(true);
    const [inputValue, setInputValue] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const triggerChangeEvent = useCallback(() => {
      const event: any = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: {
          name,
          id,
          value: inputValue,
        },
      });
      onChangeProp && onChangeProp(event);
    }, [id, inputValue, name, onChangeProp]);

    const onChange = useCallback((event: any) => {
      setInputValue(event.target.value);
    }, []);

    useEffect(() => {
      setShowPassword(showPasswordProp);
    }, [showPasswordProp]);

    useEffect(() => {
      setInputValue(value ?? '');
    }, [value]);

    useEffect(() => {
      if (!initialRenderRef.current && onChangeShowPassword) {
        onChangeShowPassword(showPassword);
      }
    }, [onChangeShowPassword, showPassword]);

    useEffect(() => {
      if (!initialRenderRef.current) {
        triggerChangeEvent();
      }
    }, [triggerChangeEvent]);

    useEffect(() => {
      initialRenderRef.current = false;
      return () => {
        initialRenderRef.current = true;
      };
    }, []);

    return (
      <TextField
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        {...{ name, id, onChange, disabled }}
        value={inputValue}
        type={showPassword ? 'text' : 'password'}
        endAdornment={
          !disabled ? (
            <IconButton
              aria-label="Toggle password visibility"
              onClick={() => {
                setShowPassword((prevShowPassword) => !prevShowPassword);
              }}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              sx={{ p: 0.4 }}
            >
              {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          ) : null
        }
        sx={{
          ...sx,
        }}
      />
    );
  }
);

export default PasswordField;
