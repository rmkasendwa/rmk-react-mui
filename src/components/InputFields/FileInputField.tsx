import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { forwardRef, useEffect, useRef, useState } from 'react';

import { formatBytes } from '../../utils/bytes';
import TextField, { ITextFieldProps } from './TextField';

export interface IFileInputFieldProps extends Omit<ITextFieldProps, 'value'> {
  value?: File | null;
}

export const FileInputField = forwardRef<HTMLDivElement, IFileInputFieldProps>(
  function FileInputField(
    { onClick, onChange, value, name, disabled, showClearButton, sx, ...rest },
    ref
  ) {
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
          }}
        />
        <TextField
          ref={ref}
          {...rest}
          {...{ name, disabled }}
          value={selectedFileName}
          onClick={(event) => {
            if (inputFieldRef.current) {
              inputFieldRef.current.click();
            }
            onClick && onClick(event);
          }}
          InputProps={{
            startAdornment: !disabled ? (
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
            ) : null,
            endAdornment: (
              <>
                {showClearButton && selectedFileName && !disabled ? (
                  <Tooltip title="Clear">
                    <IconButton
                      className="file-input-clear-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (inputFieldRef.current) {
                          inputFieldRef.current.value = '';
                          inputFieldRef.current.dispatchEvent(
                            new Event('change', { bubbles: true })
                          );
                        }
                      }}
                      sx={{ p: 0.4 }}
                    >
                      <CloseIcon color="inherit" />
                    </IconButton>
                  </Tooltip>
                ) : null}
                <Tooltip title="Select a file">
                  <IconButton sx={{ p: 0.4 }}>
                    <CloudUploadIcon color="inherit" />
                  </IconButton>
                </Tooltip>
              </>
            ),
            readOnly: true,
          }}
          sx={{
            '& .file-input-clear-button': {
              visibility: 'hidden',
            },
            '&:hover .file-input-clear-button': {
              visibility: 'visible',
            },
            ...sx,
          }}
        />
      </>
    );
  }
);

export default FileInputField;
