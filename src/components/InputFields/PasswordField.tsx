import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { FC, useCallback, useEffect, useState } from 'react';

import TextField, { ITextFieldProps } from './TextField';

export interface IPasswordFieldProps extends ITextFieldProps {
  value?: string;
  showPassword?: boolean;
}

export const PasswordField: FC<IPasswordFieldProps> = ({
  showPassword: showPasswordProp = false,
  name,
  id,
  value,
  onChange,
  ...rest
}) => {
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
    onChange && onChange(event);
  }, [id, inputValue, name, onChange]);

  useEffect(() => {
    setShowPassword(showPasswordProp);
  }, [showPasswordProp]);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  return (
    <TextField
      {...rest}
      {...{ name, id }}
      value={inputValue}
      onChange={(event) => {
        setInputValue(event.target.value);
        onChange && onChange(event);
      }}
      type={showPassword ? 'text' : 'password'}
      InputProps={{
        endAdornment: (
          <>
            {inputValue.length > 0 && (
              <Tooltip title="Clear">
                <IconButton
                  onClick={(event) => {
                    event.stopPropagation();
                    setInputValue('');
                  }}
                  sx={{ p: 0.4 }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => {
                setShowPassword((prevShowPassword) => !prevShowPassword);
                triggerChangeEvent();
              }}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              sx={{ p: 0.4 }}
            >
              {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </>
        ),
      }}
    />
  );
};

export default PasswordField;
