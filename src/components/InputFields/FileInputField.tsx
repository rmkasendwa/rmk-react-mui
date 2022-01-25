import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, IconButton, InputAdornment } from '@mui/material';
import { useFormikContext } from 'formik';
import { FC, useEffect, useRef, useState } from 'react';

import { formatBytes } from '../../utils/bytes';
import TextField, { ITextFieldProps } from './TextField';

export interface IFileInputFieldProps extends ITextFieldProps {
  value?: File | null;
}

export const FileInputField: FC<IFileInputFieldProps> = ({
  onClick,
  onChange,
  value,
  name,
  sx,
  ...rest
}) => {
  const { handleChange, values } = (useFormikContext() as any) || {};
  value ??
    (value = (() => {
      if (values && name && values[name] != null) {
        return values[name];
      }
    })());

  const inputFieldRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    if (value) {
      setSelectedFileName(`${value.name} (${formatBytes(value.size)})`);
    } else {
      setSelectedFileName('');
    }
  }, [value]);

  return (
    <>
      <input
        ref={inputFieldRef}
        type="file"
        style={{ display: 'none' }}
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            setSelectedFileName(
              `${event.target.files[0].name} (${formatBytes(
                event.target.files[0].size
              )})`
            );
          } else {
            setSelectedFileName('');
          }
          const eventTarget = {
            name,
            value: event.target?.files?.[0],
          };
          const changeEvent: any = new Event('change', { bubbles: true });
          Object.defineProperty(changeEvent, 'target', {
            writable: false,
            value: eventTarget,
          });
          onChange && onChange(changeEvent);
          handleChange && handleChange(changeEvent);
        }}
      />
      <TextField
        {...rest}
        {...{ name }}
        value={selectedFileName}
        onClick={(event) => {
          if (inputFieldRef.current) {
            inputFieldRef.current.click();
          }
          onClick && onClick(event);
        }}
        sx={{
          ...sx,
          '&>.MuiInputBase-formControl': {
            pr: 0,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Button
                variant="contained"
                color="inherit"
                size="small"
                sx={{
                  height: 24,
                  fontWeight: 'normal',
                }}
              >
                Choose File
              </Button>
            </InputAdornment>
          ),
          endAdornment:
            selectedFileName.length > 0 ? (
              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  if (inputFieldRef.current) {
                    inputFieldRef.current.value = '';
                    inputFieldRef.current.dispatchEvent(
                      new Event('change', { bubbles: true })
                    );
                  }
                }}
              >
                <CloseIcon color="inherit" />
              </IconButton>
            ) : (
              <IconButton>
                <CloudUploadIcon color="inherit" />
              </IconButton>
            ),
          readOnly: true,
        }}
      />
    </>
  );
};

export default FileInputField;
