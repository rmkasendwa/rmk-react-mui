import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

import TextField, { ITextFieldProps } from './TextField';

export interface IPasswordFieldProps extends ITextFieldProps {
  value?: string;
  showPassword?: boolean;
  onChangeShowPassword?: (showPassword: boolean) => void;
}

export const PasswordField: FC<IPasswordFieldProps> = ({
  showPassword: showPasswordProp = false,
  name,
  id,
  value,
  onChange: onChangeProp,
  onChangeShowPassword,
  sx,
  ...rest
}) => {
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

  const onChange = useCallback((event) => {
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
      {...rest}
      {...{ name, id, onChange }}
      value={inputValue}
      type={showPassword ? 'text' : 'password'}
      endAdornment={
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
      }
      sx={{
        ...sx,
      }}
    />
  );
};

export default PasswordField;
