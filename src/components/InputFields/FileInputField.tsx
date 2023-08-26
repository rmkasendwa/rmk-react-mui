import { formatBytes } from '@infinite-debugger/rmk-utils/bytes';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import clsx from 'clsx';
import { forwardRef, useEffect, useRef, useState } from 'react';

import Tooltip from '../Tooltip';
import TextField, { TextFieldProps } from './TextField';

export interface FileInputFieldClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type FileInputFieldClassKey = keyof FileInputFieldClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiFileInputField: FileInputFieldProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiFileInputField: keyof FileInputFieldClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiFileInputField?: {
      defaultProps?: ComponentsProps['MuiFileInputField'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiFileInputField'];
      variants?: ComponentsVariants['MuiFileInputField'];
    };
  }
}
//#endregion

export const getFileInputFieldUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiFileInputField', slot);
};

const slots: Record<FileInputFieldClassKey, [FileInputFieldClassKey]> = {
  root: ['root'],
};

export const fileInputFieldClasses: FileInputFieldClasses =
  generateUtilityClasses(
    'MuiFileInputField',
    Object.keys(slots) as FileInputFieldClassKey[]
  );

export interface FileInputFieldProps extends Omit<TextFieldProps, 'value'> {
  value?: File | null;
}

export const FileInputField = forwardRef<HTMLDivElement, FileInputFieldProps>(
  function FileInputField(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiFileInputField' });
    const {
      className,
      onClick,
      onChange,
      value,
      name,
      disabled,
      showClearButton = true,
      sx,
      ...rest
    } = props;

    const classes = composeClasses(
      slots,
      getFileInputFieldUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

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
          className={clsx(classes.root)}
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
